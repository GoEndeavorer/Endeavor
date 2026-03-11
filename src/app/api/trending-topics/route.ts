import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { sql, or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Top categories by active endeavor count
  const categoryBreakdown = await db
    .select({
      category: endeavor.category,
      count: sql<number>`count(*)::int`,
      openCount: sql<number>`count(*) FILTER (WHERE ${endeavor.status} = 'open')::int`,
      memberTotal: sql<number>`(
        SELECT COALESCE(SUM(mc.cnt), 0)::int
        FROM (
          SELECT COUNT(*)::int as cnt
          FROM ${member}
          WHERE ${member.endeavorId} = ANY(ARRAY_AGG(${endeavor.id}))
          AND ${member.status} = 'approved'
        ) mc
      )::int`,
    })
    .from(endeavor)
    .where(or(eq(endeavor.status, "open"), eq(endeavor.status, "in-progress")))
    .groupBy(endeavor.category);

  // Popular needs/skills across active endeavors
  const popularNeeds = await db.execute(
    sql`SELECT n AS need, COUNT(*)::int AS count
        FROM ${endeavor}, unnest(${endeavor.needs}) AS n
        WHERE ${endeavor.status} IN ('open', 'in-progress')
          AND ${endeavor.needs} IS NOT NULL
        GROUP BY n
        ORDER BY count DESC
        LIMIT 30`
  );

  // Popular user skills
  const popularSkills = await db.execute(
    sql`SELECT s AS skill, COUNT(*)::int AS count
        FROM ${user}, unnest(${user.skills}) AS s
        WHERE ${user.skills} IS NOT NULL
        GROUP BY s
        ORDER BY count DESC
        LIMIT 20`
  );

  // Popular user interests
  const popularInterests = await db.execute(
    sql`SELECT i AS interest, COUNT(*)::int AS count
        FROM ${user}, unnest(${user.interests}) AS i
        WHERE ${user.interests} IS NOT NULL
        GROUP BY i
        ORDER BY count DESC
        LIMIT 20`
  );

  // Location hotspots
  const topLocations = await db
    .select({
      location: endeavor.location,
      count: sql<number>`count(*)::int`,
    })
    .from(endeavor)
    .where(
      sql`${endeavor.location} IS NOT NULL AND ${endeavor.location} != '' AND (${endeavor.status} = 'open' OR ${endeavor.status} = 'in-progress')`
    )
    .groupBy(endeavor.location)
    .orderBy(sql`count(*) DESC`)
    .limit(15);

  return NextResponse.json({
    categories: categoryBreakdown,
    needs: popularNeeds.rows as { need: string; count: number }[],
    skills: popularSkills.rows as { skill: string; count: number }[],
    interests: popularInterests.rows as { interest: string; count: number }[],
    locations: topLocations.filter((l) => l.location),
  });
}
