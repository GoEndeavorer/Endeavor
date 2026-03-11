import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type ActivityRow = {
  type: string;
  title: string;
  detail: string | null;
  endeavor_id: string;
  endeavor_title: string;
  created_at: string;
};

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // ISO date string
  const limit = 50;

  const cursorClause = cursor
    ? sql`AND created_at < ${cursor}`
    : sql``;

  const result = await db.execute(sql`
    (
      SELECT
        'task_completed' AS type,
        t.title AS title,
        NULL AS detail,
        t.endeavor_id AS endeavor_id,
        e.title AS endeavor_title,
        t.updated_at AS created_at
      FROM task t
      JOIN endeavor e ON e.id = t.endeavor_id
      WHERE t.assignee_id = ${userId}
        AND t.task_status = 'done'
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'discussion' AS type,
        LEFT(d.content, 100) AS title,
        NULL AS detail,
        d.endeavor_id AS endeavor_id,
        e.title AS endeavor_title,
        d.created_at AS created_at
      FROM discussion d
      JOIN endeavor e ON e.id = d.endeavor_id
      WHERE d.author_id = ${userId}
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'story' AS type,
        s.title AS title,
        NULL AS detail,
        s.endeavor_id AS endeavor_id,
        e.title AS endeavor_title,
        s.created_at AS created_at
      FROM story s
      JOIN endeavor e ON e.id = s.endeavor_id
      WHERE s.author_id = ${userId}
        AND s.published = true
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'joined' AS type,
        'Joined endeavor' AS title,
        m.role::text AS detail,
        m.endeavor_id AS endeavor_id,
        e.title AS endeavor_title,
        m.joined_at AS created_at
      FROM member m
      JOIN endeavor e ON e.id = m.endeavor_id
      WHERE m.user_id = ${userId}
        AND m.status = 'approved'
        ${cursorClause}
    )
    UNION ALL
    (
      SELECT
        'endorsement' AS type,
        LEFT(en.content, 100) AS title,
        en.rating::text AS detail,
        en.endeavor_id AS endeavor_id,
        e.title AS endeavor_title,
        en.created_at AS created_at
      FROM endorsement en
      JOIN endeavor e ON e.id = en.endeavor_id
      WHERE en.author_id = ${userId}
        ${cursorClause}
    )
    ORDER BY created_at DESC
    LIMIT ${limit + 1}
  `);

  const rows = result.rows as ActivityRow[];
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  const nextCursor = hasMore
    ? items[items.length - 1].created_at
    : null;

  return NextResponse.json({
    items: items.map((row) => ({
      type: row.type,
      title: row.title,
      detail: row.detail,
      endeavorId: row.endeavor_id,
      endeavorTitle: row.endeavor_title,
      createdAt:
        typeof row.created_at === "string"
          ? row.created_at
          : new Date(row.created_at).toISOString(),
    })),
    nextCursor,
  });
}
