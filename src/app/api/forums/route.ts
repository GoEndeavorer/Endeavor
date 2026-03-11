import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ensureTable = () =>
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS forum (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      post_count INT NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

export async function GET(request: NextRequest) {
  await ensureTable();

  const category = request.nextUrl.searchParams.get("category");

  const result = category
    ? await db.execute(sql`
        SELECT f.*, u.name as creator_name
        FROM forum f
        JOIN "user" u ON f.created_by = u.id
        WHERE f.category = ${category}
        ORDER BY f.post_count DESC, f.created_at DESC
      `)
    : await db.execute(sql`
        SELECT f.*, u.name as creator_name
        FROM forum f
        JOIN "user" u ON f.created_by = u.id
        ORDER BY f.post_count DESC, f.created_at DESC
      `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, category } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO forum (name, description, category, created_by)
    VALUES (${name.trim()}, ${description || null}, ${category || "general"}, ${session.user.id})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
