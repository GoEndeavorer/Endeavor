import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { task, discussion, story, member } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Get contribution data for the last 84 days (12 weeks)
  const daysAgo = 84;
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  // Count daily contributions from tasks completed, discussions posted, stories published
  const contributions = await db.execute(sql`
    SELECT date::text, COALESCE(SUM(cnt), 0)::int as count
    FROM generate_series(
      ${startDate.toISOString()}::date,
      CURRENT_DATE,
      '1 day'::interval
    ) AS date
    LEFT JOIN (
      SELECT created_at::date as d, COUNT(*) as cnt
      FROM discussion
      WHERE author_id = ${userId} AND created_at >= ${startDate.toISOString()}::timestamp
      GROUP BY created_at::date
      UNION ALL
      SELECT updated_at::date as d, COUNT(*) as cnt
      FROM task
      WHERE assignee_id = ${userId} AND task_status = 'done' AND updated_at >= ${startDate.toISOString()}::timestamp
      GROUP BY updated_at::date
      UNION ALL
      SELECT created_at::date as d, COUNT(*) as cnt
      FROM story
      WHERE author_id = ${userId} AND published = true AND created_at >= ${startDate.toISOString()}::timestamp
      GROUP BY created_at::date
      UNION ALL
      SELECT joined_at::date as d, COUNT(*) as cnt
      FROM member
      WHERE user_id = ${userId} AND status = 'approved' AND joined_at >= ${startDate.toISOString()}::timestamp
      GROUP BY joined_at::date
    ) contributions ON contributions.d = date::date
    GROUP BY date
    ORDER BY date
  `);

  return NextResponse.json(
    contributions.rows.map((r: Record<string, unknown>) => ({
      date: String(r.date).split("T")[0],
      count: Number(r.count),
    }))
  );
}
