import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ── Platform totals ────────────────────────────────────────────────────
    const totalsResult = await db.execute(sql`
      SELECT
        (SELECT count(*) FROM "user")::int            AS users,
        (SELECT count(*) FROM endeavor)::int           AS endeavors,
        (SELECT count(*) FROM task)::int               AS tasks,
        (SELECT count(*) FROM story WHERE published = true)::int AS stories,
        (SELECT count(*) FROM discussion)::int         AS discussions,
        (SELECT count(*) FROM endorsement)::int        AS endorsements
    `);
    const totals = totalsResult.rows[0];

    // ── Growth: new users per week (last 12 weeks) ─────────────────────────
    const usersPerWeekResult = await db.execute(sql`
      SELECT
        date_trunc('week', created_at)::date AS week,
        count(*)::int AS count
      FROM "user"
      WHERE created_at >= now() - interval '12 weeks'
      GROUP BY week
      ORDER BY week
    `);

    // ── Growth: new endeavors per week (last 12 weeks) ─────────────────────
    const endeavorsPerWeekResult = await db.execute(sql`
      SELECT
        date_trunc('week', created_at)::date AS week,
        count(*)::int AS count
      FROM endeavor
      WHERE created_at >= now() - interval '12 weeks'
      GROUP BY week
      ORDER BY week
    `);

    // ── Category breakdown: endeavors per category ─────────────────────────
    const categoryBreakdownResult = await db.execute(sql`
      SELECT category, count(*)::int AS count
      FROM endeavor
      GROUP BY category
      ORDER BY count DESC
    `);

    // ── Status breakdown: endeavors by status ──────────────────────────────
    const statusBreakdownResult = await db.execute(sql`
      SELECT status, count(*)::int AS count
      FROM endeavor
      GROUP BY status
      ORDER BY count DESC
    `);

    // ── Top categories by member count ─────────────────────────────────────
    const topCategoriesByMembersResult = await db.execute(sql`
      SELECT e.category, count(m.id)::int AS members
      FROM endeavor e
      JOIN member m ON m.endeavor_id = e.id AND m.status = 'approved'
      GROUP BY e.category
      ORDER BY members DESC
      LIMIT 10
    `);

    // ── Most active time of day (discussions by hour) ──────────────────────
    const discussionsByHourResult = await db.execute(sql`
      SELECT
        extract(hour FROM created_at)::int AS hour,
        count(*)::int AS count
      FROM discussion
      GROUP BY hour
      ORDER BY hour
    `);

    // ── Average completion rate for endeavors ──────────────────────────────
    const completionRateResult = await db.execute(sql`
      SELECT
        CASE
          WHEN count(*) = 0 THEN 0
          ELSE round(
            100.0 * count(*) FILTER (WHERE status = 'completed') / count(*),
            1
          )
        END AS completion_rate
      FROM endeavor
      WHERE status != 'draft'
    `);

    return NextResponse.json({
      totals,
      usersPerWeek: usersPerWeekResult.rows,
      endeavorsPerWeek: endeavorsPerWeekResult.rows,
      categoryBreakdown: categoryBreakdownResult.rows,
      statusBreakdown: statusBreakdownResult.rows,
      topCategoriesByMembers: topCategoriesByMembersResult.rows,
      discussionsByHour: discussionsByHourResult.rows,
      completionRate: Number(completionRateResult.rows[0]?.completion_rate ?? 0),
    });
  } catch (error) {
    console.error("Platform stats error:", error);
    return NextResponse.json(
      { error: "Failed to load platform stats" },
      { status: 500 },
    );
  }
}
