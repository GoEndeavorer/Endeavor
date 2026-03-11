import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member, task, discussion, user } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — member contribution breakdown for an endeavor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const contributions = await db.execute(sql`
    SELECT
      u.id as user_id,
      u.name,
      u.image,
      m.role,
      (SELECT COUNT(*)::int FROM task t WHERE t.assignee_id = u.id AND t.endeavor_id = ${id} AND t.task_status = 'done') as tasks_completed,
      (SELECT COUNT(*)::int FROM task t WHERE t.assignee_id = u.id AND t.endeavor_id = ${id}) as tasks_assigned,
      (SELECT COUNT(*)::int FROM discussion d WHERE d.author_id = u.id AND d.endeavor_id = ${id}) as discussions,
      m.created_at as joined_at
    FROM member m
    JOIN "user" u ON m.user_id = u.id
    WHERE m.endeavor_id = ${id} AND m.status = 'approved'
    ORDER BY tasks_completed DESC, discussions DESC
  `);

  return NextResponse.json(contributions.rows);
}
