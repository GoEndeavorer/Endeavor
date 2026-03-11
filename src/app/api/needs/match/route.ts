import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find endeavors whose needs match the user's skills
  const result = await db.execute(sql`
    WITH user_skills AS (
      SELECT skills FROM "user" WHERE id = ${session.user.id}
    )
    SELECT
      e.id,
      e.title,
      e.category,
      e.status,
      e.image_url as "imageUrl",
      e.tagline,
      e.needs,
      (SELECT COUNT(*) FROM member m WHERE m.endeavor_id = e.id)::int as "memberCount",
      COALESCE(
        array_length(
          ARRAY(
            SELECT unnest(e.needs) INTERSECT SELECT unnest((SELECT skills FROM user_skills))
          ), 1
        ), 0
      ) as "matchCount"
    FROM endeavor e, user_skills us
    WHERE e.status IN ('open', 'in-progress')
      AND e.needs IS NOT NULL
      AND array_length(e.needs, 1) > 0
      AND us.skills IS NOT NULL
      AND array_length(us.skills, 1) > 0
      AND e.needs && us.skills
      AND e.creator_id != ${session.user.id}
      AND NOT EXISTS (
        SELECT 1 FROM member m
        WHERE m.endeavor_id = e.id AND m.user_id = ${session.user.id}
      )
    ORDER BY "matchCount" DESC, e.created_at DESC
    LIMIT 20
  `);

  const matches = (result.rows as {
    id: string;
    title: string;
    category: string;
    status: string;
    imageUrl: string | null;
    tagline: string | null;
    needs: string[];
    memberCount: number;
    matchCount: number;
  }[]).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    status: r.status,
    imageUrl: r.imageUrl,
    tagline: r.tagline,
    needs: r.needs,
    memberCount: r.memberCount,
    matchCount: r.matchCount,
  }));

  return NextResponse.json(matches);
}
