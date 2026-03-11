import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { templates } from "../../route";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate template exists
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const { rating, review } = await request.json();

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  // Ensure table exists
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

  // Upsert rating
  const result = await db.execute(sql`
    INSERT INTO template_rating (template_id, user_id, rating, review)
    VALUES (${templateId}, ${session.user.id}, ${Math.round(rating)}, ${review || null})
    ON CONFLICT (template_id, user_id) DO UPDATE
    SET rating = EXCLUDED.rating, review = EXCLUDED.review, created_at = NOW()
    RETURNING *
  `);

  // Fetch updated aggregate
  const agg = await db.execute(sql`
    SELECT
      ROUND(AVG(rating)::numeric, 1) AS avg_rating,
      COUNT(*)::int AS rating_count
    FROM template_rating
    WHERE template_id = ${templateId}
  `);

  const stats = agg.rows[0] as { avg_rating: string; rating_count: number };

  return NextResponse.json({
    rating: result.rows[0],
    avgRating: parseFloat(stats.avg_rating),
    ratingCount: stats.rating_count,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;

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

  const result = await db.execute(sql`
    SELECT tr.rating, tr.review, tr.created_at,
           u.name AS author_name, u.image AS author_image
    FROM template_rating tr
    JOIN "user" u ON tr.user_id = u.id
    WHERE tr.template_id = ${templateId}
    ORDER BY tr.created_at DESC
    LIMIT 20
  `);

  const agg = await db.execute(sql`
    SELECT
      ROUND(AVG(rating)::numeric, 1) AS avg_rating,
      COUNT(*)::int AS rating_count
    FROM template_rating
    WHERE template_id = ${templateId}
  `);

  const stats = agg.rows[0] as { avg_rating: string; rating_count: number };

  return NextResponse.json({
    reviews: result.rows,
    avgRating: stats.avg_rating ? parseFloat(stats.avg_rating) : 0,
    ratingCount: stats.rating_count,
  });
}
