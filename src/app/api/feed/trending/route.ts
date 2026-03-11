import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Get endeavors with the most activity in the last 7 days
  const result = await db.execute(sql`
    WITH activity_scores AS (
      SELECT
        e.id,
        e.title,
        e.category,
        e.status,
        e.image_url as "imageUrl",
        e.tagline,
        (SELECT COUNT(*) FROM member m WHERE m.endeavor_id = e.id)::int as "memberCount",
        (
          (SELECT COUNT(*) FROM member m2 WHERE m2.endeavor_id = e.id AND m2.joined_at > NOW() - INTERVAL '7 days') * 3 +
          (SELECT COUNT(*) FROM discussion d WHERE d.endeavor_id = e.id AND d.created_at > NOW() - INTERVAL '7 days') * 2 +
          (SELECT COUNT(*) FROM milestone ms WHERE ms.endeavor_id = e.id AND ms.created_at > NOW() - INTERVAL '7 days') * 5
        ) as activity_score
      FROM endeavor e
      WHERE e.status IN ('open', 'in-progress')
    )
    SELECT * FROM activity_scores
    WHERE activity_score > 0
    ORDER BY activity_score DESC
    LIMIT 10
  `);

  const trending = (result.rows as {
    id: string;
    title: string;
    category: string;
    status: string;
    imageUrl: string | null;
    tagline: string | null;
    memberCount: number;
    activity_score: number;
  }[]).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    status: r.status,
    imageUrl: r.imageUrl,
    tagline: r.tagline,
    memberCount: r.memberCount,
    activityScore: Number(r.activity_score),
  }));

  return NextResponse.json(trending);
}
