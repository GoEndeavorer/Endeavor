import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ensureTables = async () => {
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
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS snippet_like (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      snippet_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(snippet_id, user_id)
    )
  `);
};

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  const { snippetId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();

  // Check if already liked
  const existing = await db.execute(sql`
    SELECT id FROM snippet_like
    WHERE snippet_id = ${snippetId} AND user_id = ${session.user.id}
  `);

  if ((existing.rows as { id: string }[]).length > 0) {
    // Unlike
    await db.execute(sql`
      DELETE FROM snippet_like
      WHERE snippet_id = ${snippetId} AND user_id = ${session.user.id}
    `);
    await db.execute(sql`
      UPDATE snippet SET like_count = GREATEST(like_count - 1, 0) WHERE id = ${snippetId}
    `);
    return NextResponse.json({ action: "unliked" });
  } else {
    // Like
    await db.execute(sql`
      INSERT INTO snippet_like (snippet_id, user_id)
      VALUES (${snippetId}, ${session.user.id})
    `);
    await db.execute(sql`
      UPDATE snippet SET like_count = like_count + 1 WHERE id = ${snippetId}
    `);
    return NextResponse.json({ action: "liked" });
  }
}
