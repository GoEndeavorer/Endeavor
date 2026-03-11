import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, milestone, task, discussion, story, update, user } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type TimelineEvent = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  actorName: string | null;
  actorId: string | null;
  createdAt: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50"), 100);

  // Unified timeline query combining multiple event sources
  const result = await db.execute(sql`
    (
      SELECT
        m.id::text as id,
        'member_joined' as type,
        CONCAT(u.name, ' joined the team') as title,
        m.role as detail,
        u.name as actor_name,
        u.id as actor_id,
        m.created_at as created_at
      FROM member m
      JOIN "user" u ON m.user_id = u.id
      WHERE m.endeavor_id = ${id} AND m.status = 'approved'
    )
    UNION ALL
    (
      SELECT
        ms.id::text,
        CASE WHEN ms.completed THEN 'milestone_completed' ELSE 'milestone_created' END,
        CONCAT(CASE WHEN ms.completed THEN 'Milestone completed: ' ELSE 'Milestone added: ' END, ms.title),
        ms.description,
        NULL,
        NULL,
        COALESCE(ms.completed_at, ms.created_at)
      FROM milestone ms
      WHERE ms.endeavor_id = ${id}
    )
    UNION ALL
    (
      SELECT
        t.id::text,
        CASE WHEN t.status = 'done' THEN 'task_completed' ELSE 'task_created' END,
        CONCAT(CASE WHEN t.status = 'done' THEN 'Task completed: ' ELSE 'Task created: ' END, t.title),
        t.priority,
        u.name,
        u.id,
        t.created_at
      FROM task t
      LEFT JOIN "user" u ON t.assignee_id = u.id
      WHERE t.endeavor_id = ${id}
    )
    UNION ALL
    (
      SELECT
        d.id::text,
        'discussion' as type,
        LEFT(d.content, 100) as title,
        NULL,
        u.name,
        u.id,
        d.created_at
      FROM discussion d
      JOIN "user" u ON d.author_id = u.id
      WHERE d.endeavor_id = ${id} AND d.parent_id IS NULL
    )
    UNION ALL
    (
      SELECT
        s.id::text,
        'story_published' as type,
        CONCAT('Story published: ', s.title),
        NULL,
        u.name,
        u.id,
        s.created_at
      FROM story s
      JOIN "user" u ON s.author_id = u.id
      WHERE s.endeavor_id = ${id} AND s.published = true
    )
    UNION ALL
    (
      SELECT
        up.id::text,
        'update_posted' as type,
        CONCAT('Update: ', up.title),
        LEFT(up.content, 120),
        u.name,
        u.id,
        up.created_at
      FROM update up
      JOIN "user" u ON up.author_id = u.id
      WHERE up.endeavor_id = ${id}
    )
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);

  const events: TimelineEvent[] = (result.rows as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    type: row.type as string,
    title: row.title as string,
    detail: row.detail as string | null,
    actorName: row.actor_name as string | null,
    actorId: row.actor_id as string | null,
    createdAt: (row.created_at as Date).toISOString(),
  }));

  return NextResponse.json(events);
}
