import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { story, user } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — related stories (same endeavor, or same author)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;

  // Get the current story
  const [current] = await db
    .select({ endeavorId: story.endeavorId, authorId: story.authorId })
    .from(story)
    .where(eq(story.id, storyId))
    .limit(1);

  if (!current) {
    return NextResponse.json([]);
  }

  // Find related stories from same endeavor or same author
  const related = await db
    .select({
      id: story.id,
      title: story.title,
      authorName: user.name,
      createdAt: story.createdAt,
      endeavorId: story.endeavorId,
    })
    .from(story)
    .innerJoin(user, eq(story.authorId, user.id))
    .where(
      and(
        eq(story.published, true),
        ne(story.id, storyId),
        eq(story.endeavorId, current.endeavorId)
      )
    )
    .orderBy(desc(story.createdAt))
    .limit(3);

  // If we don't have 3, fill with author's other stories
  if (related.length < 3) {
    const authorStories = await db
      .select({
        id: story.id,
        title: story.title,
        authorName: user.name,
        createdAt: story.createdAt,
        endeavorId: story.endeavorId,
      })
      .from(story)
      .innerJoin(user, eq(story.authorId, user.id))
      .where(
        and(
          eq(story.published, true),
          ne(story.id, storyId),
          eq(story.authorId, current.authorId),
          ne(story.endeavorId, current.endeavorId)
        )
      )
      .orderBy(desc(story.createdAt))
      .limit(3 - related.length);

    related.push(...authorStories);
  }

  return NextResponse.json(related);
}
