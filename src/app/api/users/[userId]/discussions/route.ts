import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussion, user, endeavor } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const posts = await db
    .select({
      id: discussion.id,
      content: discussion.content,
      createdAt: discussion.createdAt,
      endeavorId: discussion.endeavorId,
      endeavorTitle: endeavor.title,
    })
    .from(discussion)
    .innerJoin(endeavor, eq(discussion.endeavorId, endeavor.id))
    .where(eq(discussion.authorId, userId))
    .orderBy(desc(discussion.createdAt))
    .limit(5);

  return NextResponse.json(posts);
}
