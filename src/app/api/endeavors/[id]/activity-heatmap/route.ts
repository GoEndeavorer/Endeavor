import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.execute(sql`
    WITH daily_activity AS (
      SELECT DATE(created_at) as activity_date, COUNT(*) as cnt
      FROM discussion
      WHERE endeavor_id = ${id} AND created_at > NOW() - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT DATE(created_at) as activity_date, COUNT(*) as cnt
      FROM task
      WHERE endeavor_id = ${id} AND created_at > NOW() - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT DATE(completed_at) as activity_date, COUNT(*) as cnt
      FROM milestone
      WHERE endeavor_id = ${id} AND completed = true AND completed_at > NOW() - INTERVAL '90 days'
      GROUP BY DATE(completed_at)
      UNION ALL
      SELECT DATE(joined_at) as activity_date, COUNT(*) as cnt
      FROM member
      WHERE endeavor_id = ${id} AND joined_at > NOW() - INTERVAL '90 days'
      GROUP BY DATE(joined_at)
    )
    SELECT
      activity_date::text as date,
      SUM(cnt)::int as count
    FROM daily_activity
    WHERE activity_date IS NOT NULL
    GROUP BY activity_date
    ORDER BY activity_date
  `);

  const data = (result.rows as { date: string; count: number }[]).map((r) => ({
    date: r.date,
    count: r.count,
  }));

  return NextResponse.json(data);
}
