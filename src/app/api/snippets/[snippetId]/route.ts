import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  const { snippetId } = await params;

  await db.execute(sql`
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

  const result = await db.execute(sql`
    SELECT s.*, u.name as author_name, u.image as author_image
    FROM snippet s
    JOIN "user" u ON s.author_id = u.id
    WHERE s.id = ${snippetId}
  `);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
