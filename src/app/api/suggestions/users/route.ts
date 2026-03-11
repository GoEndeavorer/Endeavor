import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Suggest users who:
  // 1. Share endeavors with the current user (collaborators)
  // 2. Have similar skills
  // 3. Are popular (most followers)
  // Exclude already-followed users
  const result = await db.execute(sql`
    WITH already_following AS (
      SELECT following_id FROM follow WHERE follower_id = ${userId}
    ),
    co_members AS (
      SELECT DISTINCT m2.user_id AS suggested_id, 3 AS score
      FROM member m1
      JOIN member m2 ON m1.endeavor_id = m2.endeavor_id
      WHERE m1.user_id = ${userId}
        AND m2.user_id != ${userId}
        AND m1.status = 'approved'
        AND m2.status = 'approved'
        AND m2.user_id NOT IN (SELECT following_id FROM already_following)
    ),
    skill_matches AS (
      SELECT DISTINCT u2.id AS suggested_id, 2 AS score
      FROM "user" u1, unnest(u1.skills) AS s1
      JOIN "user" u2 ON s1 = ANY(u2.skills)
      WHERE u1.id = ${userId}
        AND u2.id != ${userId}
        AND u2.id NOT IN (SELECT following_id FROM already_following)
      LIMIT 20
    ),
    combined AS (
      SELECT suggested_id, SUM(score) AS total_score
      FROM (
        SELECT * FROM co_members
        UNION ALL
        SELECT * FROM skill_matches
      ) all_matches
      GROUP BY suggested_id
      ORDER BY total_score DESC
      LIMIT 10
    )
    SELECT
      u.id,
      u.name,
      u.image,
      u.bio,
      u.skills,
      c.total_score AS relevance
    FROM combined c
    JOIN "user" u ON u.id = c.suggested_id
    ORDER BY c.total_score DESC
  `);

  const suggestions = result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id,
      name: row.name,
      image: row.image,
      bio: row.bio,
      skills: row.skills,
    };
  });

  return NextResponse.json(suggestions);
}
