import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ensureTables = () =>
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS forum_post (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      forum_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      reply_count INT NOT NULL DEFAULT 0,
      vote_count INT NOT NULL DEFAULT 0,
      pinned BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  const { forumId } = await params;
  await ensureTables();

  const sort = request.nextUrl.searchParams.get("sort") || "newest";

  const orderClause =
    sort === "top"
      ? sql`fp.vote_count DESC, fp.created_at DESC`
      : sort === "oldest"
        ? sql`fp.created_at ASC`
        : sql`fp.pinned DESC, fp.created_at DESC`;

  const result = await db.execute(sql`
    SELECT fp.*, u.name as author_name, u.image as author_image
    FROM forum_post fp
    JOIN "user" u ON fp.author_id = u.id
    WHERE fp.forum_id = ${forumId}
    ORDER BY ${orderClause}
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  const { forumId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body } = await request.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and body required" }, { status: 400 });
  }

  await ensureTables();

  const result = await db.execute(sql`
    INSERT INTO forum_post (forum_id, author_id, title, body)
    VALUES (${forumId}, ${session.user.id}, ${title.trim()}, ${body.trim()})
    RETURNING *
  `);

  // Increment post_count on forum
  await db.execute(sql`
    UPDATE forum SET post_count = post_count + 1 WHERE id = ${forumId}
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
