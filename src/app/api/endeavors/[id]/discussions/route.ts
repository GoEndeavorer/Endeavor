import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussion, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

  const messages = await db
    .select({
      id: discussion.id,
      content: discussion.content,
      createdAt: discussion.createdAt,
      authorId: user.id,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(discussion)
    .innerJoin(user, eq(discussion.authorId, user.id))
    .where(eq(discussion.endeavorId, id))
    .orderBy(desc(discussion.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const [msg] = await db
    .insert(discussion)
    .values({
      endeavorId: id,
      authorId: session.user.id,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json(
    { ...msg, authorName: session.user.name, authorImage: session.user.image },
    { status: 201 }
  );
}
