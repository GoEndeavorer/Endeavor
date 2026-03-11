import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { directMessage, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, or, lt, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — fetch message thread with a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { partnerId } = await params;
  const userId = session.user.id;
  const cursor = request.nextUrl.searchParams.get("cursor");

  // Get partner info
  const [partner] = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(eq(user.id, partnerId))
    .limit(1);

  if (!partner) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch messages between the two users
  let query = sql`
    SELECT dm.id, dm.sender_id, dm.recipient_id, dm.content, dm.read, dm.created_at
    FROM direct_message dm
    WHERE (
      (dm.sender_id = ${userId} AND dm.recipient_id = ${partnerId})
      OR (dm.sender_id = ${partnerId} AND dm.recipient_id = ${userId})
    )
  `;

  if (cursor) {
    query = sql`${query} AND dm.created_at < ${cursor}::timestamp`;
  }

  query = sql`${query} ORDER BY dm.created_at DESC LIMIT 50`;

  const messages = await db.execute(query);

  // Mark unread messages from partner as read
  await db
    .update(directMessage)
    .set({ read: true })
    .where(
      and(
        eq(directMessage.senderId, partnerId),
        eq(directMessage.recipientId, userId),
        eq(directMessage.read, false)
      )
    );

  const rows = messages.rows as Array<{
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    read: boolean;
    created_at: string;
  }>;

  return NextResponse.json({
    partner,
    messages: rows.reverse(),
    nextCursor: rows.length === 50 ? rows[0].created_at : null,
  });
}
