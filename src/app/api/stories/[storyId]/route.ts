import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { story } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(story)
    .where(eq(story.id, storyId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can edit" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.title) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.published !== undefined) updates.published = body.published;

  const [updated] = await db
    .update(story)
    .set(updates)
    .where(eq(story.id, storyId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(story)
    .where(eq(story.id, storyId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can delete" }, { status: 403 });
  }

  await db.delete(story).where(eq(story.id, storyId));
  return NextResponse.json({ success: true });
}
