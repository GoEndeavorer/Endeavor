import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { templates } from "../route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "popular"; // popular | rating | newest

  // Ensure rating table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS template_rating (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(template_id, user_id)
    )
  `);

  // Ensure use-count table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS template_use (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Fetch aggregate ratings
  const ratingsResult = await db.execute(sql`
    SELECT
      template_id,
      ROUND(AVG(rating)::numeric, 1) AS avg_rating,
      COUNT(*)::int AS rating_count
    FROM template_rating
    GROUP BY template_id
  `);

  const ratingsMap = new Map(
    (ratingsResult.rows as { template_id: string; avg_rating: string; rating_count: number }[]).map((r) => [
      r.template_id,
      { avgRating: parseFloat(r.avg_rating), ratingCount: r.rating_count },
    ])
  );

  // Fetch use counts
  const usesResult = await db.execute(sql`
    SELECT template_id, COUNT(*)::int AS use_count
    FROM template_use
    GROUP BY template_id
  `);

  const usesMap = new Map(
    (usesResult.rows as { template_id: string; use_count: number }[]).map((r) => [
      r.template_id,
      r.use_count,
    ])
  );

  // Fetch recent reviews (up to 3 per template)
  const reviewsResult = await db.execute(sql`
    SELECT DISTINCT ON (tr.template_id, tr.user_id)
      tr.template_id, tr.rating, tr.review, tr.created_at,
      u.name AS author_name, u.image AS author_image
    FROM template_rating tr
    JOIN "user" u ON tr.user_id = u.id
    WHERE tr.review IS NOT NULL AND tr.review != ''
    ORDER BY tr.template_id, tr.user_id, tr.created_at DESC
  `);

  type ReviewRow = {
    template_id: string;
    rating: number;
    review: string;
    created_at: string;
    author_name: string;
    author_image: string | null;
  };

  const reviewsMap = new Map<string, ReviewRow[]>();
  for (const row of reviewsResult.rows as ReviewRow[]) {
    const list = reviewsMap.get(row.template_id) || [];
    if (list.length < 3) list.push(row);
    reviewsMap.set(row.template_id, list);
  }

  // Enrich static templates with marketplace data
  let enriched = templates.map((t) => {
    const ratingData = ratingsMap.get(t.id) || { avgRating: 0, ratingCount: 0 };
    const useCount = usesMap.get(t.id) || 0;
    const reviews = (reviewsMap.get(t.id) || []).map((r) => ({
      rating: r.rating,
      review: r.review,
      createdAt: r.created_at,
      authorName: r.author_name,
      authorImage: r.author_image,
    }));

    return {
      ...t,
      avgRating: ratingData.avgRating,
      ratingCount: ratingData.ratingCount,
      useCount,
      reviews,
    };
  });

  // Apply filters
  if (category) {
    enriched = enriched.filter((t) => t.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    enriched = enriched.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.suggestedNeeds.some((n) => n.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sort === "rating") {
    enriched.sort((a, b) => b.avgRating - a.avgRating || b.ratingCount - a.ratingCount);
  } else if (sort === "newest") {
    // Static templates don't have created_at, so keep original order
  } else {
    // popular — sort by use count
    enriched.sort((a, b) => b.useCount - a.useCount || b.avgRating - a.avgRating);
  }

  return NextResponse.json(enriched);
}
