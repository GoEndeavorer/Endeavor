import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Aggregate daily activity from multiple tables over the last 90 days
  const result = await db.execute(sql`
    WITH daily_activity AS (
      SELECT created_at::date as day, COUNT(*) as cnt FROM discussion WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '90 days' GROUP BY created_at::date
      UNION ALL
      SELECT created_at::date as day, COUNT(*) as cnt FROM task WHERE assignee_id = ${userId} AND created_at > NOW() - INTERVAL '90 days' GROUP BY created_at::date
      UNION ALL
      SELECT created_at::date as day, COUNT(*) as cnt FROM story WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '90 days' GROUP BY created_at::date
      UNION ALL
      SELECT joined_at::date as day, COUNT(*) as cnt FROM member WHERE user_id = ${userId} AND joined_at > NOW() - INTERVAL '90 days' GROUP BY joined_at::date
    )
    SELECT
      d::date as date,
      COALESCE(SUM(da.cnt), 0)::int as count
    FROM generate_series(
      (NOW() - INTERVAL '90 days')::date,
      NOW()::date,
      '1 day'::interval
    ) as d
    LEFT JOIN daily_activity da ON da.day = d::date
    GROUP BY d::date
    ORDER BY d::date ASC
  `);

  return NextResponse.json({
    days: (result.rows as { date: string; count: number }[]).map((r) => ({
      date: String(r.date).slice(0, 10),
      count: Number(r.count),
    })),
  });
}
