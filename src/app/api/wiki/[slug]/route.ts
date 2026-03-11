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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await ensureTable();

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTable();

  const existing = await db.execute(sql`
    SELECT * FROM wiki_page WHERE slug = ${slug} LIMIT 1
  `);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const { title, content } = await request.json();
  const currentRevision = Number(existing.rows[0].revision) || 1;

  const updates: string[] = [];
  const newTitle = title?.trim() || existing.rows[0].title;
  const newContent = content?.trim() || existing.rows[0].content;

  const result = await db.execute(sql`
    UPDATE wiki_page
    SET title = ${newTitle},
        content = ${newContent},
        revision = ${currentRevision + 1},
        updated_at = NOW()
    WHERE slug = ${slug}
    RETURNING *
  `);

  return NextResponse.json(result.rows[0]);
}
