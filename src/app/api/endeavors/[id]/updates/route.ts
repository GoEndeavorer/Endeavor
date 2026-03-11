import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { update, user, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";
import { notifyEndeavorMembers } from "@/lib/notifications";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await db
    .select({
      id: update.id,
      title: update.title,
      content: update.content,
      pinned: update.pinned,
      createdAt: update.createdAt,
      authorName: user.name,
    })
    .from(update)
    .innerJoin(user, eq(update.authorId, user.id))
    .where(eq(update.endeavorId, id))
    .orderBy(desc(update.pinned), desc(update.createdAt));

  return NextResponse.json(updates);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only creator can post updates
  const [end] = await db
    .select({ creatorId: endeavor.creatorId, title: endeavor.title })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can post updates" }, { status: 403 });
  }

  const { title, content, pinned } = await request.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const [newUpdate] = await db
    .insert(update)
    .values({
      endeavorId: id,
      authorId: session.user.id,
      title: title.trim(),
      content: content.trim(),
      pinned: pinned || false,
    })
    .returning();

  // Notify members
  await notifyEndeavorMembers(
    id,
    "update_posted",
    `New update in "${end.title}": ${title.trim()}`,
    session.user.id
  );

  return NextResponse.json(
    { ...newUpdate, authorName: session.user.name },
    { status: 201 }
  );
}
