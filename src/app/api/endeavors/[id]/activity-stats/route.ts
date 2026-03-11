import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [members, tasks, discussions, milestones, stories] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int as count FROM endeavor_member WHERE endeavor_id = ${id}`),
    db.execute(sql`SELECT COUNT(*)::int as total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)::int as completed FROM task WHERE endeavor_id = ${id}`),
    db.execute(sql`SELECT COUNT(*)::int as count FROM discussion_post WHERE endeavor_id = ${id}`),
    db.execute(sql`SELECT COUNT(*)::int as total, SUM(CASE WHEN completed = true THEN 1 ELSE 0 END)::int as completed FROM milestone WHERE endeavor_id = ${id}`),
    db.execute(sql`SELECT COUNT(*)::int as count FROM story WHERE "endeavorId" = ${id}`),
  ]);

  return NextResponse.json({
    members: (members.rows[0] as { count: number }).count,
    tasks: {
      total: (tasks.rows[0] as { total: number }).total,
      completed: (tasks.rows[0] as { completed: number }).completed || 0,
    },
    discussions: (discussions.rows[0] as { count: number }).count,
    milestones: {
      total: (milestones.rows[0] as { total: number }).total,
      completed: (milestones.rows[0] as { completed: number }).completed || 0,
    },
    stories: (stories.rows[0] as { count: number }).count,
  });
}
