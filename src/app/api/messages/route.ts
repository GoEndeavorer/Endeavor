import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function ensureTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS conversation (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS conversation_participant (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES "user"(id),
      last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(conversation_id, user_id)
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS message (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES "user"(id),
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

// GET — list conversations for the current user with last message preview and unread count
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTables();

  const userId = session.user.id;

  const result = await db.execute(sql`
    SELECT
      c.id AS conversation_id,
      c.created_at AS conversation_created_at,
      last_msg.body AS last_message,
      last_msg.created_at AS last_message_at,
      last_msg.sender_id AS last_message_sender_id,
      partner.id AS partner_id,
      partner.name AS partner_name,
      partner.image AS partner_image,
      (
        SELECT COUNT(*)::int
        FROM message m2
        WHERE m2.conversation_id = c.id
          AND m2.sender_id != ${userId}
          AND m2.created_at > cp.last_read_at
      ) AS unread_count
    FROM conversation_participant cp
    JOIN conversation c ON c.id = cp.conversation_id
    JOIN conversation_participant cp2
      ON cp2.conversation_id = c.id AND cp2.user_id != ${userId}
    JOIN "user" partner ON partner.id = cp2.user_id
    LEFT JOIN LATERAL (
      SELECT m.body, m.created_at, m.sender_id
      FROM message m
      WHERE m.conversation_id = c.id
      ORDER BY m.created_at DESC
      LIMIT 1
    ) last_msg ON true
    WHERE cp.user_id = ${userId}
    ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC
  `);

  return NextResponse.json(result.rows);
}

// POST — start a new conversation (or return existing one) with a recipient
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTables();

  const body = await request.json();
  const { recipientId, content } = body;

  if (!recipientId) {
    return NextResponse.json({ error: "recipientId is required" }, { status: 400 });
  }

  if (recipientId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Verify recipient exists
  const recipientCheck = await db.execute(sql`
    SELECT id FROM "user" WHERE id = ${recipientId} LIMIT 1
  `);
  if (recipientCheck.rows.length === 0) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const userId = session.user.id;

  // Check if a conversation already exists between these two users
  const existing = await db.execute(sql`
    SELECT cp1.conversation_id
    FROM conversation_participant cp1
    JOIN conversation_participant cp2
      ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = ${userId}
      AND cp2.user_id = ${recipientId}
    LIMIT 1
  `);

  let conversationId: string;

  if (existing.rows.length > 0) {
    conversationId = (existing.rows[0] as { conversation_id: string }).conversation_id;
  } else {
    // Create new conversation
    const convResult = await db.execute(sql`
      INSERT INTO conversation DEFAULT VALUES RETURNING id
    `);
    conversationId = (convResult.rows[0] as { id: string }).id;

    // Add both participants
    await db.execute(sql`
      INSERT INTO conversation_participant (conversation_id, user_id)
      VALUES (${conversationId}, ${userId}), (${conversationId}, ${recipientId})
    `);
  }

  // If content was provided, send the first message
  if (content?.trim()) {
    if (content.trim().length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000)" }, { status: 400 });
    }

    await db.execute(sql`
      INSERT INTO message (conversation_id, sender_id, body)
      VALUES (${conversationId}, ${userId}, ${content.trim()})
    `);
  }

  return NextResponse.json({ conversationId }, { status: 201 });
}
