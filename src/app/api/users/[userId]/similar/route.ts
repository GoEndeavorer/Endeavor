import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Find users with overlapping skills or interests
  const result = await db.execute(sql`
    WITH target_user AS (
      SELECT skills, interests FROM "user" WHERE id = ${userId}
    )
    SELECT
      u.id,
      u.name,
      u.image,
      u.bio,
      (
        COALESCE(array_length(
          ARRAY(SELECT unnest(u.skills) INTERSECT SELECT unnest((SELECT skills FROM target_user))),
          1
        ), 0) +
        COALESCE(array_length(
          ARRAY(SELECT unnest(u.interests) INTERSECT SELECT unnest((SELECT interests FROM target_user))),
          1
        ), 0)
      ) as overlap_score
    FROM "user" u, target_user tu
    WHERE u.id != ${userId}
      AND (
        (u.skills IS NOT NULL AND tu.skills IS NOT NULL AND u.skills && tu.skills)
        OR (u.interests IS NOT NULL AND tu.interests IS NOT NULL AND u.interests && tu.interests)
      )
    ORDER BY overlap_score DESC
    LIMIT 6
  `);

  const similar = (result.rows as {
    id: string;
    name: string;
    image: string | null;
    bio: string | null;
    overlap_score: number;
  }[]).map((r) => ({
    id: r.id,
    name: r.name,
    image: r.image,
    bio: r.bio,
    overlapScore: Number(r.overlap_score),
  }));

  return NextResponse.json(similar);
}
