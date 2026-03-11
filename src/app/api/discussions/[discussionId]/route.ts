import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussion, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// Edit a discussion message (author only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { discussionId } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(discussion)
    .where(eq(discussion.id, discussionId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can edit" }, { status: 403 });
  }

  const [updated] = await db
    .update(discussion)
    .set({ content: content.trim() })
    .where(eq(discussion.id, discussionId))
    .returning();

  return NextResponse.json(updated);
}

// Delete a discussion message (author or endeavor creator)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { discussionId } = await params;

  const [existing] = await db
    .select()
    .from(discussion)
    .where(eq(discussion.id, discussionId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Allow author or endeavor creator to delete
  const isAuthor = existing.authorId === session.user.id;

  if (!isAuthor) {
    const [end] = await db
      .select({ creatorId: endeavor.creatorId })
      .from(endeavor)
      .where(eq(endeavor.id, existing.endeavorId))
      .limit(1);

    if (end?.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete" }, { status: 403 });
    }
  }

  await db.delete(discussion).where(eq(discussion.id, discussionId));
  return NextResponse.json({ success: true });
}
