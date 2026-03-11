import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_room (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      endeavor_id UUID,
      type TEXT NOT NULL DEFAULT 'public',
      creator_id TEXT NOT NULL,
      member_count INT NOT NULL DEFAULT 1,
      last_message_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT cr.*, u.name as creator_name
      FROM chat_room cr
      JOIN "user" u ON cr.creator_id = u.id
      WHERE cr.endeavor_id = ${endeavorId}
      ORDER BY cr.last_message_at DESC NULLS LAST
    `);
  } else {
    result = await db.execute(sql`
      SELECT cr.*, u.name as creator_name
      FROM chat_room cr
      JOIN "user" u ON cr.creator_id = u.id
      WHERE cr.type = 'public'
      ORDER BY cr.member_count DESC, cr.last_message_at DESC NULLS LAST
      LIMIT 50
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, endeavorId, type } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_room (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      endeavor_id UUID,
      type TEXT NOT NULL DEFAULT 'public',
      creator_id TEXT NOT NULL,
      member_count INT NOT NULL DEFAULT 1,
      last_message_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO chat_room (name, description, endeavor_id, type, creator_id)
    VALUES (${name.trim()}, ${description || null}, ${endeavorId || null}, ${type || "public"}, ${session.user.id})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
