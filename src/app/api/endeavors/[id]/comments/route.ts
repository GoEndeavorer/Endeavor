import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_comment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      parent_id UUID,
      vote_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT c.*, u.name as author_name, u.image as author_image
    FROM endeavor_comment c
    JOIN "user" u ON c.author_id = u.id
    WHERE c.endeavor_id = ${id}
    ORDER BY c.created_at ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body, parentId } = await request.json();
  if (!body?.trim()) return NextResponse.json({ error: "Body required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_comment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      parent_id UUID,
      vote_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO endeavor_comment (endeavor_id, author_id, body, parent_id)
    VALUES (${id}, ${session.user.id}, ${body.trim()}, ${parentId || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
