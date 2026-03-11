import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ensureTable = () =>
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS snippet (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      title TEXT,
      description TEXT,
      code TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'javascript',
      visibility TEXT NOT NULL DEFAULT 'public',
      fork_count INT NOT NULL DEFAULT 0,
      like_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

export async function GET(request: NextRequest) {
  await ensureTable();

  const language = request.nextUrl.searchParams.get("language");
  const search = request.nextUrl.searchParams.get("search");

  let query = sql`
    SELECT s.*, u.name as author_name, u.image as author_image
    FROM snippet s
    JOIN "user" u ON s.author_id = u.id
    WHERE s.visibility = 'public'
  `;

  if (language) {
    query = sql`${query} AND s.language = ${language}`;
  }
  if (search) {
    query = sql`${query} AND (s.title ILIKE ${"%" + search + "%"} OR s.description ILIKE ${"%" + search + "%"} OR s.code ILIKE ${"%" + search + "%"})`;
  }

  query = sql`${query} ORDER BY s.created_at DESC LIMIT 100`;

  const result = await db.execute(query);
  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, code, language, visibility } = await request.json();
  if (!code?.trim()) return NextResponse.json({ error: "Code required" }, { status: 400 });

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO snippet (author_id, title, description, code, language, visibility)
    VALUES (
      ${session.user.id},
      ${title || null},
      ${description || null},
      ${code.trim()},
      ${language || "javascript"},
      ${visibility || "public"}
    )
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
