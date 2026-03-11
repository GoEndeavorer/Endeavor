import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Number(searchParams.get("limit")) || 50);
  const before = searchParams.get("before");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_message (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID NOT NULL,
      sender_id TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (before) {
    result = await db.execute(sql`
      SELECT cm.*, u.name as sender_name, u.image as sender_image
      FROM chat_message cm
      JOIN "user" u ON cm.sender_id = u.id
      WHERE cm.room_id = ${roomId} AND cm.created_at < ${before}
      ORDER BY cm.created_at DESC LIMIT ${limit}
    `);
  } else {
    result = await db.execute(sql`
      SELECT cm.*, u.name as sender_name, u.image as sender_image
      FROM chat_message cm
      JOIN "user" u ON cm.sender_id = u.id
      WHERE cm.room_id = ${roomId}
      ORDER BY cm.created_at DESC LIMIT ${limit}
    `);
  }

  return NextResponse.json(result.rows.reverse());
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = await request.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_message (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID NOT NULL,
      sender_id TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO chat_message (room_id, sender_id, body)
    VALUES (${roomId}, ${session.user.id}, ${body.trim()})
    RETURNING *
  `);

  // Update last_message_at
  await db.execute(sql`
    UPDATE chat_room SET last_message_at = NOW() WHERE id = ${roomId}
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
