import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { message, member, user } from "@/lib/db/schema";
import { eq, and, desc, lt } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — fetch messages for an endeavor (with cursor pagination)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");
  const limit = 50;

  const conditions = [eq(message.endeavorId, endeavorId)];
  if (cursor) {
    conditions.push(lt(message.createdAt, new Date(cursor)));
  }

  const messages = await db
    .select({
      id: message.id,
      content: message.content,
      authorId: message.authorId,
      authorName: user.name,
      authorImage: user.image,
      createdAt: message.createdAt,
    })
    .from(message)
    .innerJoin(user, eq(message.authorId, user.id))
    .where(and(...conditions))
    .orderBy(desc(message.createdAt))
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  const data = messages.slice(0, limit).reverse();

  return NextResponse.json({
    messages: data,
    nextCursor: hasMore ? messages[limit].createdAt.toISOString() : null,
  });
}

// POST — send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { content } = await request.json();
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const [msg] = await db
    .insert(message)
    .values({
      endeavorId,
      authorId: session.user.id,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json({
    id: msg.id,
    content: msg.content,
    authorId: session.user.id,
    authorName: session.user.name,
    authorImage: session.user.image,
    createdAt: msg.createdAt,
  });
}
