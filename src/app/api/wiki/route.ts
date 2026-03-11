import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ensureTable = () =>
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS wiki_page (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      parent_slug TEXT,
      revision INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

export async function GET(request: NextRequest) {
  await ensureTable();

  const slug = request.nextUrl.searchParams.get("slug");

  if (slug) {
    const result = await db.execute(sql`
      SELECT w.*, u.name as author_name, u.image as author_image
      FROM wiki_page w
      JOIN "user" u ON w.author_id = u.id
      WHERE w.slug = ${slug}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  }

  const result = await db.execute(sql`
    SELECT w.*, u.name as author_name, u.image as author_image
    FROM wiki_page w
    JOIN "user" u ON w.author_id = u.id
    ORDER BY w.title ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, title, content, parent_slug } = await request.json();
  if (!slug?.trim() || !title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Slug, title, and content are required" },
      { status: 400 }
    );
  }

  await ensureTable();

  // Check for duplicate slug
  const existing = await db.execute(sql`
    SELECT id FROM wiki_page WHERE slug = ${slug.trim()}
  `);
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "A page with this slug already exists" },
      { status: 409 }
    );
  }

  const result = await db.execute(sql`
    INSERT INTO wiki_page (slug, title, content, author_id, parent_slug)
    VALUES (
      ${slug.trim()},
      ${title.trim()},
      ${content.trim()},
      ${session.user.id},
      ${parent_slug || null}
    )
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
