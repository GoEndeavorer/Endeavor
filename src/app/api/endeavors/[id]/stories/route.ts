import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { story, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

// Public: get published stories for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stories = await db
    .select({
      id: story.id,
      title: story.title,
      content: story.content,
      published: story.published,
      createdAt: story.createdAt,
      authorName: user.name,
    })
    .from(story)
    .innerJoin(user, eq(story.authorId, user.id))
    .where(and(eq(story.endeavorId, id), eq(story.published, true)))
    .orderBy(desc(story.createdAt));

  return NextResponse.json(stories);
}

// Members only: create a story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, published } = await request.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const [s] = await db
    .insert(story)
    .values({
      endeavorId: id,
      authorId: session.user.id,
      title: title.trim(),
      content: content.trim(),
      published: published || false,
    })
    .returning();

  return NextResponse.json(s, { status: 201 });
}
