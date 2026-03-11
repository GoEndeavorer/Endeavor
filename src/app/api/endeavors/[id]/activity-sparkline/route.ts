import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const days = Math.min(Number(request.nextUrl.searchParams.get("days") || 14), 90);

  const result = await db.execute(sql`
    WITH dates AS (
      SELECT generate_series(
        CURRENT_DATE - ${days}::int * INTERVAL '1 day',
        CURRENT_DATE,
        INTERVAL '1 day'
      )::date as day
    ),
    activity AS (
      SELECT DATE(created_at) as day, COUNT(*) as cnt
      FROM discussion
      WHERE endeavor_id = ${id} AND created_at >= CURRENT_DATE - ${days}::int * INTERVAL '1 day'
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT DATE(created_at) as day, COUNT(*) as cnt
      FROM task
      WHERE endeavor_id = ${id} AND created_at >= CURRENT_DATE - ${days}::int * INTERVAL '1 day'
      GROUP BY DATE(created_at)
    )
    SELECT d.day, COALESCE(SUM(a.cnt), 0) as count
    FROM dates d
    LEFT JOIN activity a ON a.day = d.day
    GROUP BY d.day
    ORDER BY d.day
  `);

  return NextResponse.json({
    points: result.rows.map((r) => Number((r as { count: number }).count)),
  });
}
