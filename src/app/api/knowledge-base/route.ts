import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kb_article (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      tags TEXT[] DEFAULT '{}',
      published BOOLEAN NOT NULL DEFAULT true,
      view_count INT NOT NULL DEFAULT 0,
      helpful_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let whereClause = "WHERE a.published = true";
  if (category) whereClause += ` AND a.category = '${category.replace(/'/g, "''")}'`;
  if (search) {
    const escaped = search.replace(/'/g, "''");
    whereClause += ` AND (a.title ILIKE '%${escaped}%' OR a.content ILIKE '%${escaped}%')`;
  }

  const result = await db.execute(
    sql.raw(`
      SELECT a.*, u.name as author_name
      FROM kb_article a
      JOIN "user" u ON a.author_id = u.id
      ${whereClause}
      ORDER BY a.helpful_count DESC, a.created_at DESC
      LIMIT 50
    `)
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, category, tags } = await request.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kb_article (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      tags TEXT[] DEFAULT '{}',
      published BOOLEAN NOT NULL DEFAULT true,
      view_count INT NOT NULL DEFAULT 0,
      helpful_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO kb_article (author_id, title, content, category, tags)
    VALUES (${session.user.id}, ${title.trim()}, ${content.trim()}, ${category || "general"}, ${tags || []})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
