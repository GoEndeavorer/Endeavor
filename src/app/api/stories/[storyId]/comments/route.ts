import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { comment, user, story } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list comments on a story
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;

  const comments = await db
    .select({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      authorName: user.name,
      authorImage: user.image,
      createdAt: comment.createdAt,
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(eq(comment.storyId, storyId))
    .orderBy(desc(comment.createdAt));

  return NextResponse.json(comments);
}

// POST — add a comment to a story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify story exists and is published
  const [theStory] = await db
    .select()
    .from(story)
    .where(eq(story.id, storyId))
    .limit(1);

  if (!theStory || !theStory.published) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const { content } = await request.json();
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  const [created] = await db
    .insert(comment)
    .values({
      storyId,
      authorId: session.user.id,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json({
    id: created.id,
    content: created.content,
    authorId: session.user.id,
    authorName: session.user.name,
    authorImage: session.user.image,
    createdAt: created.createdAt,
  }, { status: 201 });
}
