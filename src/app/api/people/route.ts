import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, member, endeavor } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const skill = request.nextUrl.searchParams.get("skill")?.trim();
  const sort = request.nextUrl.searchParams.get("sort") || "active";

  const people = await db
    .select({
      id: user.id,
      name: user.name,
      bio: user.bio,
      image: user.image,
      location: user.location,
      skills: user.skills,
      interests: user.interests,
      createdAt: user.createdAt,
      endeavorCount: sql<number>`(
        SELECT COUNT(DISTINCT ${member.endeavorId})
        FROM ${member}
        WHERE ${member.userId} = ${user.id}
        AND ${member.status} = 'approved'
      )::int`,
      createdCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${endeavor}
        WHERE ${endeavor.creatorId} = ${user.id}
      )::int`,
    })
    .from(user)
    .where(
      skill
        ? sql`EXISTS (SELECT 1 FROM unnest(${user.skills}) AS s WHERE s ILIKE ${`%${skill}%`})`
        : undefined
    )
    .orderBy(
      sort === "newest"
        ? desc(user.createdAt)
        : sort === "creators"
          ? desc(sql`(SELECT COUNT(*) FROM ${endeavor} WHERE ${endeavor.creatorId} = ${user.id})`)
          : desc(sql`(SELECT COUNT(DISTINCT ${member.endeavorId}) FROM ${member} WHERE ${member.userId} = ${user.id} AND ${member.status} = 'approved')`)
    )
    .limit(50);

  // Get popular skills for filtering
  const skillCounts = await db.execute(
    sql`SELECT s AS skill, COUNT(*) AS count
        FROM ${user}, unnest(${user.skills}) AS s
        GROUP BY s
        ORDER BY count DESC
        LIMIT 20`
  );

  return NextResponse.json({
    people,
    popularSkills: skillCounts.rows as { skill: string; count: number }[],
  });
}
