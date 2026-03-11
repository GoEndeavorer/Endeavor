import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET — fetch messages in a conversation (also marks as read)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  const userId = session.user.id;

  // Verify the user is a participant
  const participantCheck = await db.execute(sql`
    SELECT id FROM conversation_participant
    WHERE conversation_id = ${conversationId} AND user_id = ${userId}
    LIMIT 1
  `);
  if (participantCheck.rows.length === 0) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Get partner info
  const partnerResult = await db.execute(sql`
    SELECT u.id, u.name, u.image
    FROM conversation_participant cp
    JOIN "user" u ON u.id = cp.user_id
    WHERE cp.conversation_id = ${conversationId} AND cp.user_id != ${userId}
    LIMIT 1
  `);
  const partner = partnerResult.rows[0] as { id: string; name: string; image: string | null } | undefined;

  // Fetch messages ordered by created_at ASC
  const cursor = request.nextUrl.searchParams.get("cursor");
  let messagesResult;
  if (cursor) {
    messagesResult = await db.execute(sql`
      SELECT m.id, m.sender_id, m.body, m.created_at,
             u.name AS sender_name, u.image AS sender_image
      FROM message m
      JOIN "user" u ON u.id = m.sender_id
      WHERE m.conversation_id = ${conversationId}
        AND m.created_at < ${cursor}::timestamptz
      ORDER BY m.created_at ASC
    `);
  } else {
    messagesResult = await db.execute(sql`
      SELECT m.id, m.sender_id, m.body, m.created_at,
             u.name AS sender_name, u.image AS sender_image
      FROM message m
      JOIN "user" u ON u.id = m.sender_id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `);
  }

  // Mark messages as read by updating last_read_at
  await db.execute(sql`
    UPDATE conversation_participant
    SET last_read_at = now()
    WHERE conversation_id = ${conversationId} AND user_id = ${userId}
  `);

  const rows = messagesResult.rows as Array<{
    id: string;
    sender_id: string;
    body: string;
    created_at: string;
    sender_name: string;
    sender_image: string | null;
  }>;

  return NextResponse.json({
    conversationId,
    partner: partner || null,
    messages: rows,
  });
}

// POST — send a message in a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  const userId = session.user.id;

  // Verify the user is a participant
  const participantCheck = await db.execute(sql`
    SELECT id FROM conversation_participant
    WHERE conversation_id = ${conversationId} AND user_id = ${userId}
    LIMIT 1
  `);
  if (participantCheck.rows.length === 0) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  if (content.trim().length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000)" }, { status: 400 });
  }

  const result = await db.execute(sql`
    INSERT INTO message (conversation_id, sender_id, body)
    VALUES (${conversationId}, ${userId}, ${content.trim()})
    RETURNING id, sender_id, body, created_at
  `);

  const msg = result.rows[0] as {
    id: string;
    sender_id: string;
    body: string;
    created_at: string;
  };

  // Update sender's last_read_at
  await db.execute(sql`
    UPDATE conversation_participant
    SET last_read_at = now()
    WHERE conversation_id = ${conversationId} AND user_id = ${userId}
  `);

  return NextResponse.json(msg, { status: 201 });
}
