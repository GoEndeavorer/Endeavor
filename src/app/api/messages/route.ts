import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { directMessage, user, notification } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, or, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list conversations (unique partners with last message)
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const conversations = await db.execute(sql`
    WITH ranked AS (
      SELECT
        dm.*,
        ROW_NUMBER() OVER (
          PARTITION BY CASE
            WHEN dm.sender_id = ${userId} THEN dm.recipient_id
            ELSE dm.sender_id
          END
          ORDER BY dm.created_at DESC
        ) as rn,
        CASE
          WHEN dm.sender_id = ${userId} THEN dm.recipient_id
          ELSE dm.sender_id
        END as partner_id
      FROM direct_message dm
      WHERE dm.sender_id = ${userId} OR dm.recipient_id = ${userId}
    )
    SELECT
      r.id,
      r.content as last_message,
      r.created_at as last_message_at,
      r.sender_id,
      r.read,
      r.partner_id,
      u.name as partner_name,
      u.image as partner_image,
      (
        SELECT COUNT(*)::int FROM direct_message
        WHERE sender_id = r.partner_id
        AND recipient_id = ${userId}
        AND read = false
      ) as unread_count
    FROM ranked r
    JOIN "user" u ON r.partner_id = u.id
    WHERE r.rn = 1
    ORDER BY r.created_at DESC
  `);

  return NextResponse.json(conversations.rows);
}

// POST — send a direct message
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { recipientId, content } = body;

  if (!recipientId || !content?.trim()) {
    return NextResponse.json({ error: "recipientId and content required" }, { status: 400 });
  }

  if (content.trim().length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000)" }, { status: 400 });
  }

  if (recipientId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Verify recipient exists
  const [recipient] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, recipientId))
    .limit(1);

  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const [msg] = await db
    .insert(directMessage)
    .values({
      senderId: session.user.id,
      recipientId,
      content: content.trim(),
    })
    .returning();

  // Create notification for recipient
  await db.insert(notification).values({
    userId: recipientId,
    type: "direct_message",
    message: `${session.user.name} sent you a message`,
  });

  return NextResponse.json(msg, { status: 201 });
}
