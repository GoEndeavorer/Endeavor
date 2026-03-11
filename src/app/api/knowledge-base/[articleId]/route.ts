import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;

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
    UPDATE kb_article
    SET view_count = view_count + 1
    WHERE id = ${articleId}
    RETURNING *
  `);

  if (!result.rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authorResult = await db.execute(sql`
    SELECT name FROM "user" WHERE id = ${result.rows[0].author_id}
  `);

  return NextResponse.json({
    ...result.rows[0],
    author_name: authorResult.rows[0]?.name || "Unknown",
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const existing = await db.execute(sql`
    SELECT * FROM kb_article WHERE id = ${articleId} LIMIT 1
  `);

  if (!existing.rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.rows[0].author_id !== session.user.id) {
    return NextResponse.json({ error: "Only the author can edit" }, { status: 403 });
  }

  const { title, content, category, tags, published } = await request.json();

  const setClauses: string[] = ["updated_at = NOW()"];
  if (title !== undefined) setClauses.push(`title = '${String(title).replace(/'/g, "''")}'`);
  if (content !== undefined) setClauses.push(`content = '${String(content).replace(/'/g, "''")}'`);
  if (category !== undefined) setClauses.push(`category = '${String(category).replace(/'/g, "''")}'`);
  if (published !== undefined) setClauses.push(`published = ${published ? "true" : "false"}`);

  const result = await db.execute(
    sql.raw(`
      UPDATE kb_article
      SET ${setClauses.join(", ")}
      WHERE id = '${articleId.replace(/'/g, "''")}'
      RETURNING *
    `)
  );

  return NextResponse.json(result.rows[0]);
}
