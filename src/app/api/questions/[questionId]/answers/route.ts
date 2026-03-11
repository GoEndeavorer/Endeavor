import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list answers for a question
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS answer (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      vote_count INT NOT NULL DEFAULT 0,
      accepted BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT a.*, u.name as author_name, u.image as author_image
    FROM answer a
    JOIN "user" u ON a.author_id = u.id
    WHERE a.question_id = ${questionId}
    ORDER BY a.accepted DESC, a.vote_count DESC, a.created_at ASC
  `);

  return NextResponse.json(result.rows);
}

// POST - answer a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = await request.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: "Answer body required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS answer (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      vote_count INT NOT NULL DEFAULT 0,
      accepted BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO answer (question_id, author_id, body)
    VALUES (${questionId}, ${session.user.id}, ${body.trim()})
    RETURNING *
  `);

  // Update answer count
  await db.execute(sql`
    UPDATE question SET answer_count = answer_count + 1 WHERE id = ${questionId}
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
