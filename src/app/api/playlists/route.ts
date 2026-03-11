import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS playlist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      visibility TEXT NOT NULL DEFAULT 'public',
      item_count INT NOT NULL DEFAULT 0,
      follower_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  await ensureTable();

  let result;
  if (category) {
    result = await db.execute(sql`
      SELECT p.*, u.name as creator_name, u.image as creator_image
      FROM playlist p
      JOIN "user" u ON p.creator_id = u.id
      WHERE p.visibility = 'public' AND p.category = ${category}
      ORDER BY p.follower_count DESC, p.created_at DESC
    `);
  } else {
    result = await db.execute(sql`
      SELECT p.*, u.name as creator_name, u.image as creator_image
      FROM playlist p
      JOIN "user" u ON p.creator_id = u.id
      WHERE p.visibility = 'public'
      ORDER BY p.follower_count DESC, p.created_at DESC
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, category, visibility } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO playlist (creator_id, title, description, category, visibility)
    VALUES (
      ${session.user.id},
      ${title.trim()},
      ${description?.trim() || null},
      ${category?.trim() || null},
      ${visibility || "public"}
    )
    RETURNING *
  `);

  const playlist = result.rows[0] as Record<string, unknown>;

  return NextResponse.json(
    { ...playlist, creator_name: session.user.name, creator_image: session.user.image },
    { status: 201 }
  );
}
