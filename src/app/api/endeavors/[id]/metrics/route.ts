import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "30";
  const days = Math.min(365, Number(period));

  // Growth metrics over time
  const [memberGrowth, taskVelocity, discussionActivity, viewCount] = await Promise.all([
    // Members joined over time
    db.execute(sql`
      SELECT DATE(joined_at) as date, COUNT(*)::int as count
      FROM endeavor_member
      WHERE endeavor_id = ${id} AND joined_at >= NOW() - ${days}::int * INTERVAL '1 day'
      GROUP BY DATE(joined_at)
      ORDER BY date ASC
    `),
    // Tasks completed over time
    db.execute(sql`
      SELECT DATE(updated_at) as date, COUNT(*)::int as count
      FROM task
      WHERE endeavor_id = ${id} AND status = 'done'
        AND updated_at >= NOW() - ${days}::int * INTERVAL '1 day'
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `),
    // Discussion posts over time
    db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM discussion_post
      WHERE endeavor_id = ${id} AND created_at >= NOW() - ${days}::int * INTERVAL '1 day'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `),
    // Total engagement metrics
    db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM endeavor_member WHERE endeavor_id = ${id}) as total_members,
        (SELECT COUNT(*)::int FROM task WHERE endeavor_id = ${id}) as total_tasks,
        (SELECT COUNT(*)::int FROM task WHERE endeavor_id = ${id} AND status = 'done') as completed_tasks,
        (SELECT COUNT(*)::int FROM discussion_post WHERE endeavor_id = ${id}) as total_discussions,
        (SELECT COUNT(*)::int FROM story WHERE "endeavorId" = ${id}) as total_stories,
        (SELECT COUNT(*)::int FROM milestone WHERE endeavor_id = ${id}) as total_milestones
    `),
  ]);

  return NextResponse.json({
    period: days,
    member_growth: memberGrowth.rows,
    task_velocity: taskVelocity.rows,
    discussion_activity: discussionActivity.rows,
    totals: viewCount.rows[0],
  });
}
