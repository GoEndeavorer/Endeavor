import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  content: string;
  rating: number;
  creator_name: string;
  creator_id: string;
  created_at: string;
};

// GET — list reviews for an endeavor (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.execute(sql`
    SELECT
      e.id,
      e.content,
      e.rating,
      u.name AS creator_name,
      u.id AS creator_id,
      e.created_at
    FROM endorsement e
    INNER JOIN "user" u ON u.id = e.author_id
    WHERE e.endeavor_id = ${id}
    ORDER BY e.created_at DESC
    LIMIT 50
  `);

  const reviews = (result.rows as unknown as ReviewRow[]).map((row) => ({
    id: row.id,
    content: row.content,
    rating: row.rating,
    creatorName: row.creator_name,
    creatorId: row.creator_id,
    createdAt: row.created_at,
  }));

  return NextResponse.json(reviews);
}

// POST — create a review (auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { content, rating } = body;

  if (!content?.trim() || content.trim().length > 1000) {
    return NextResponse.json(
      { error: "Content required (max 1000 chars)" },
      { status: 400 }
    );
  }

  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer from 1 to 5" },
      { status: 400 }
    );
  }

  // One review per user per endeavor
  const existing = await db.execute(sql`
    SELECT id FROM endorsement
    WHERE endeavor_id = ${id} AND author_id = ${session.user.id}
    LIMIT 1
  `);

  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "You have already reviewed this endeavor" },
      { status: 409 }
    );
  }

  const inserted = await db.execute(sql`
    INSERT INTO endorsement (endeavor_id, author_id, content, rating)
    VALUES (${id}, ${session.user.id}, ${content.trim()}, ${rating})
    RETURNING id, content, rating, created_at
  `);

  const row = inserted.rows[0] as Record<string, unknown>;

  return NextResponse.json(
    {
      id: row.id,
      content: row.content,
      rating: row.rating,
      creatorName: session.user.name,
      creatorId: session.user.id,
      createdAt: row.created_at,
    },
    { status: 201 }
  );
}
