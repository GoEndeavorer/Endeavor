import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS resource (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'article',
      category TEXT NOT NULL DEFAULT 'general',
      tags TEXT[] DEFAULT '{}',
      upvotes INT NOT NULL DEFAULT 0,
      view_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let whereClause = "WHERE 1=1";
  if (category) whereClause += ` AND r.category = '${category.replace(/'/g, "''")}'`;
  if (type) whereClause += ` AND r.type = '${type.replace(/'/g, "''")}'`;

  const result = await db.execute(
    sql.raw(`
      SELECT r.*, u.name as author_name
      FROM resource r
      JOIN "user" u ON r.author_id = u.id
      ${whereClause}
      ORDER BY r.upvotes DESC, r.created_at DESC
      LIMIT 50
    `)
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, url, type, category, tags } = await request.json();
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "Title and URL required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS resource (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'article',
      category TEXT NOT NULL DEFAULT 'general',
      tags TEXT[] DEFAULT '{}',
      upvotes INT NOT NULL DEFAULT 0,
      view_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO resource (author_id, title, description, url, type, category, tags)
    VALUES (${session.user.id}, ${title.trim()}, ${description || null}, ${url.trim()}, ${type || "article"}, ${category || "general"}, ${tags || []})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
