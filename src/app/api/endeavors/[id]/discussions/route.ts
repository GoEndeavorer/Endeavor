import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussion, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";
import { notifyEndeavorMembers } from "@/lib/notifications";

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
      parentId: discussion.parentId,
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

  const { content, parentId } = await request.json();
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
      parentId: parentId || null,
    })
    .returning();

  // Notify other members
  const prefix = parentId ? "Reply: " : "";
  const preview = content.trim().slice(0, 60);
  await notifyEndeavorMembers(
    id,
    "new_discussion",
    `${session.user.name}: ${prefix}${preview}${content.trim().length > 60 ? "..." : ""}`,
    session.user.id
  );

  return NextResponse.json(
    { ...msg, authorName: session.user.name, authorImage: session.user.image },
    { status: 201 }
  );
}
