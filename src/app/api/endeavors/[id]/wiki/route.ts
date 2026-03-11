import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list wiki pages for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wiki_page (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      slug TEXT NOT NULL,
      parent_id UUID,
      sort_order INT NOT NULL DEFAULT 0,
      last_edited_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      w.*,
      u.name as author_name,
      editor.name as editor_name
    FROM wiki_page w
    JOIN "user" u ON w.author_id = u.id
    LEFT JOIN "user" editor ON w.last_edited_by = editor.id
    WHERE w.endeavor_id = ${id}
    ORDER BY w.parent_id NULLS FIRST, w.sort_order ASC, w.title ASC
  `);

  return NextResponse.json(result.rows);
}

// POST - create a wiki page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, parentId } = await request.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wiki_page (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      slug TEXT NOT NULL,
      parent_id UUID,
      sort_order INT NOT NULL DEFAULT 0,
      last_edited_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO wiki_page (endeavor_id, author_id, title, content, slug, parent_id)
    VALUES (${id}, ${session.user.id}, ${title.trim()}, ${content.trim()}, ${slug}, ${parentId || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

// PATCH - update a wiki page
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pageId, title, content } = await request.json();

  if (!pageId) return NextResponse.json({ error: "Page ID required" }, { status: 400 });

  const updates: string[] = [];
  if (title?.trim()) updates.push("title");
  if (content?.trim()) updates.push("content");

  if (updates.length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Update with new slug if title changed
  if (title?.trim()) {
    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await db.execute(sql`
      UPDATE wiki_page
      SET title = ${title.trim()}, slug = ${slug}, content = COALESCE(${content?.trim() || null}, content),
          last_edited_by = ${session.user.id}, updated_at = NOW()
      WHERE id = ${pageId}
    `);
  } else {
    await db.execute(sql`
      UPDATE wiki_page
      SET content = ${content.trim()}, last_edited_by = ${session.user.id}, updated_at = NOW()
      WHERE id = ${pageId}
    `);
  }

  const result = await db.execute(sql`SELECT * FROM wiki_page WHERE id = ${pageId}`);
  return NextResponse.json(result.rows[0]);
}

// DELETE - remove a wiki page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pageId } = await request.json();

  // Verify creator or author
  const page = await db.execute(sql`
    SELECT w.author_id, e.creator_id
    FROM wiki_page w
    JOIN endeavor e ON w.endeavor_id = e.id
    WHERE w.id = ${pageId} AND w.endeavor_id = ${id}
  `);

  if (page.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = page.rows[0] as { author_id: string; creator_id: string };
  if (row.author_id !== session.user.id && row.creator_id !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await db.execute(sql`DELETE FROM wiki_page WHERE id = ${pageId}`);
  return NextResponse.json({ success: true });
}
