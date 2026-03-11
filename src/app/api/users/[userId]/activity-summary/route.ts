import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - activity summary for a user over a time period
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  const interval = `${days} days`;

  const [contributions, streakData, topEndeavors] = await Promise.all([
    // Activity counts over the period
    db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM discussion WHERE author_id = ${userId} AND created_at >= NOW() - CAST(${interval} AS INTERVAL)) as discussions,
        (SELECT COUNT(*) FROM task WHERE assignee_id = ${userId} AND status = 'completed' AND updated_at >= NOW() - CAST(${interval} AS INTERVAL)) as tasks_completed,
        (SELECT COUNT(*) FROM story WHERE author_id = ${userId} AND published = true AND created_at >= NOW() - CAST(${interval} AS INTERVAL)) as stories,
        (SELECT COUNT(*) FROM endorsement WHERE from_user_id = ${userId} AND created_at >= NOW() - CAST(${interval} AS INTERVAL)) as endorsements_given,
        (SELECT COUNT(*) FROM endorsement WHERE to_user_id = ${userId} AND created_at >= NOW() - CAST(${interval} AS INTERVAL)) as endorsements_received
    `),

    // Daily activity for streak calculation
    db.execute(sql`
      SELECT DISTINCT DATE(created_at) as active_date
      FROM (
        SELECT created_at FROM discussion WHERE author_id = ${userId} AND created_at >= NOW() - INTERVAL '60 days'
        UNION ALL
        SELECT updated_at as created_at FROM task WHERE assignee_id = ${userId} AND status = 'completed' AND updated_at >= NOW() - INTERVAL '60 days'
        UNION ALL
        SELECT created_at FROM story WHERE author_id = ${userId} AND created_at >= NOW() - INTERVAL '60 days'
      ) combined
      ORDER BY active_date DESC
    `),

    // Most active endeavors this period
    db.execute(sql`
      SELECT
        e.id,
        e.title,
        COUNT(*) as activity_count
      FROM (
        SELECT endeavor_id, created_at FROM discussion WHERE author_id = ${userId} AND created_at >= NOW() - CAST(${interval} AS INTERVAL)
        UNION ALL
        SELECT endeavor_id, updated_at FROM task WHERE assignee_id = ${userId} AND updated_at >= NOW() - CAST(${interval} AS INTERVAL)
      ) activity
      JOIN endeavor e ON activity.endeavor_id = e.id
      GROUP BY e.id, e.title
      ORDER BY activity_count DESC
      LIMIT 5
    `),
  ]);

  // Calculate streak
  let streak = 0;
  const dates = streakData.rows.map((r) => (r as { active_date: string }).active_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dates.some((d) => String(d).startsWith(dateStr))) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return NextResponse.json({
    period: days,
    contributions: contributions.rows[0],
    streak,
    topEndeavors: topEndeavors.rows,
    activeDays: dates.length,
  });
}
