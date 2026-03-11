import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const result = await db.execute(sql`
    SELECT activity_date::text AS date, COUNT(*)::int AS count
    FROM (
      SELECT DATE(updated_at) AS activity_date
      FROM task
      WHERE assignee_id = ${userId}
        AND task_status = 'done'
        AND updated_at >= NOW() - INTERVAL '365 days'

      UNION ALL

      SELECT DATE(created_at) AS activity_date
      FROM discussion
      WHERE author_id = ${userId}
        AND created_at >= NOW() - INTERVAL '365 days'

      UNION ALL

      SELECT DATE(created_at) AS activity_date
      FROM story
      WHERE author_id = ${userId}
        AND published = true
        AND created_at >= NOW() - INTERVAL '365 days'
    ) activities
    GROUP BY activity_date
    ORDER BY activity_date ASC
  `);

  const data = result.rows as { date: string; count: number }[];

  return NextResponse.json(data);
}
