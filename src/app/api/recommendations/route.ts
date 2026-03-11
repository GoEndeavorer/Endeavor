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

  // Recommend endeavors based on:
  // 1. User's skills matching endeavor needs
  // 2. Same categories as endeavors user has joined
  // 3. Popular endeavors user hasn't joined yet
  const result = await db.execute(sql`
    WITH user_skills AS (
      SELECT unnest(skills) AS skill FROM "user" WHERE id = ${userId}
    ),
    user_categories AS (
      SELECT DISTINCT e.category
      FROM member m
      JOIN endeavor e ON e.id = m.endeavor_id
      WHERE m.user_id = ${userId} AND m.status = 'approved'
    ),
    user_joined AS (
      SELECT endeavor_id FROM member WHERE user_id = ${userId}
    ),
    skill_matches AS (
      SELECT DISTINCT e.id, 3 AS score
      FROM endeavor e, unnest(e.needs) AS need
      WHERE need IN (SELECT skill FROM user_skills)
        AND e.status IN ('open', 'in-progress')
        AND e.creator_id != ${userId}
        AND e.id NOT IN (SELECT endeavor_id FROM user_joined)
    ),
    category_matches AS (
      SELECT DISTINCT e.id, 2 AS score
      FROM endeavor e
      WHERE e.category IN (SELECT category FROM user_categories)
        AND e.status IN ('open', 'in-progress')
        AND e.creator_id != ${userId}
        AND e.id NOT IN (SELECT endeavor_id FROM user_joined)
    ),
    popular AS (
      SELECT e.id, 1 AS score
      FROM endeavor e
      LEFT JOIN member m ON m.endeavor_id = e.id AND m.status = 'approved'
      WHERE e.status IN ('open', 'in-progress')
        AND e.creator_id != ${userId}
        AND e.id NOT IN (SELECT endeavor_id FROM user_joined)
      GROUP BY e.id
      ORDER BY COUNT(m.id) DESC
      LIMIT 20
    ),
    combined AS (
      SELECT id, MAX(score) AS max_score, SUM(score) AS total_score
      FROM (
        SELECT * FROM skill_matches
        UNION ALL
        SELECT * FROM category_matches
        UNION ALL
        SELECT * FROM popular
      ) all_matches
      GROUP BY id
      ORDER BY max_score DESC, total_score DESC
      LIMIT 12
    )
    SELECT
      e.id,
      e.title,
      e.description,
      e.category,
      e.status,
      e.image_url,
      e.location,
      e.location_type,
      e.needs,
      e.created_at,
      c.max_score AS match_score,
      (SELECT COUNT(*) FROM member WHERE member.endeavor_id = e.id AND member.status = 'approved') AS member_count,
      u.name AS creator_name
    FROM combined c
    JOIN endeavor e ON e.id = c.id
    JOIN "user" u ON u.id = e.creator_id
    ORDER BY c.max_score DESC, c.total_score DESC
  `);

  const recommendations = result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    let reason = "Popular";
    if (Number(row.match_score) >= 3) reason = "Matches your skills";
    else if (Number(row.match_score) >= 2) reason = "Similar to your endeavors";
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      status: row.status,
      imageUrl: row.image_url,
      location: row.location,
      locationType: row.location_type,
      needs: row.needs,
      createdAt: row.created_at,
      memberCount: Number(row.member_count),
      creatorName: row.creator_name,
      reason,
    };
  });

  return NextResponse.json(recommendations);
}
