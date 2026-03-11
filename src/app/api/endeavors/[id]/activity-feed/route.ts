import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor") || null;

  const cursorClause = cursor
    ? sql`AND created_at < ${cursor}`
    : sql``;

  const result = await db.execute(sql`
    (
      SELECT
        'member' AS type,
        CASE WHEN m.role = 'creator'
          THEN 'Created this endeavor'
          ELSE 'Joined the endeavor'
        END AS message,
        m.user_id AS "userId",
        u.name AS "userName",
        m.joined_at AS "createdAt"
      FROM member m
      INNER JOIN "user" u ON m.user_id = u.id
      WHERE m.endeavor_id = ${id}
        AND m.status = 'approved'
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'discussion' AS type,
        'Posted in discussion' AS message,
        d.author_id AS "userId",
        u.name AS "userName",
        d.created_at AS "createdAt"
      FROM discussion d
      INNER JOIN "user" u ON d.author_id = u.id
      WHERE d.endeavor_id = ${id}
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'task' AS type,
        CASE WHEN t.status = 'done'
          THEN 'Completed task: ' || t.title
          ELSE 'Created task: ' || t.title
        END AS message,
        t.created_by_id AS "userId",
        u.name AS "userName",
        t.updated_at AS "createdAt"
      FROM task t
      INNER JOIN "user" u ON t.created_by_id = u.id
      WHERE t.endeavor_id = ${id}
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'milestone' AS type,
        'Milestone reached: ' || ms.title AS message,
        '' AS "userId",
        '' AS "userName",
        COALESCE(ms.completed_at, ms.created_at) AS "createdAt"
      FROM milestone ms
      WHERE ms.endeavor_id = ${id}
        AND ms.completed = true
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'story' AS type,
        'Published story: ' || s.title AS message,
        s.author_id AS "userId",
        u.name AS "userName",
        s.created_at AS "createdAt"
      FROM story s
      INNER JOIN "user" u ON s.author_id = u.id
      WHERE s.endeavor_id = ${id}
        AND s.published = true
        ${cursorClause}
    )
    ORDER BY "createdAt" DESC
    LIMIT 20
  `);

  const items = result.rows.map((row) => ({
    type: row.type as string,
    message: row.message as string,
    userId: row.userId as string,
    userName: row.userName as string,
    createdAt: (row.createdAt as Date).toISOString(),
  }));

  return NextResponse.json(items);
}
