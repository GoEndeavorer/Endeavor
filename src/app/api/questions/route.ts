import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list questions (optionally filtered by endeavor)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");
  const tag = searchParams.get("tag");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS question (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT NOT NULL,
      body TEXT,
      tags TEXT[] DEFAULT '{}',
      answer_count INT NOT NULL DEFAULT 0,
      vote_count INT NOT NULL DEFAULT 0,
      accepted_answer_id UUID,
      solved BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT q.*, u.name as author_name, u.image as author_image
      FROM question q
      JOIN "user" u ON q.author_id = u.id
      WHERE q.endeavor_id = ${endeavorId}
      ORDER BY q.created_at DESC LIMIT 50
    `);
  } else if (tag) {
    result = await db.execute(sql`
      SELECT q.*, u.name as author_name, u.image as author_image
      FROM question q
      JOIN "user" u ON q.author_id = u.id
      WHERE ${tag} = ANY(q.tags)
      ORDER BY q.vote_count DESC, q.created_at DESC LIMIT 50
    `);
  } else {
    result = await db.execute(sql`
      SELECT q.*, u.name as author_name, u.image as author_image
      FROM question q
      JOIN "user" u ON q.author_id = u.id
      ORDER BY q.created_at DESC LIMIT 50
    `);
  }

  return NextResponse.json(result.rows);
}

// POST - ask a question
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, tags, endeavorId } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS question (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT NOT NULL,
      body TEXT,
      tags TEXT[] DEFAULT '{}',
      answer_count INT NOT NULL DEFAULT 0,
      vote_count INT NOT NULL DEFAULT 0,
      accepted_answer_id UUID,
      solved BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO question (author_id, endeavor_id, title, body, tags)
    VALUES (${session.user.id}, ${endeavorId || null}, ${title.trim()}, ${body || null}, ${tags || []})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
