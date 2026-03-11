import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endorsement, member, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list endorsements for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const endorsements = await db
    .select({
      id: endorsement.id,
      content: endorsement.content,
      rating: endorsement.rating,
      createdAt: endorsement.createdAt,
      authorId: user.id,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(endorsement)
    .innerJoin(user, eq(endorsement.authorId, user.id))
    .where(eq(endorsement.endeavorId, id))
    .orderBy(desc(endorsement.createdAt));

  return NextResponse.json(endorsements);
}

// POST — create an endorsement (members only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Must be an approved member
  const [mem] = await db
    .select()
    .from(member)
    .where(and(eq(member.endeavorId, id), eq(member.userId, session.user.id), eq(member.status, "approved")))
    .limit(1);

  if (!mem) {
    return NextResponse.json({ error: "Only members can endorse" }, { status: 403 });
  }

  // Check for existing endorsement
  const [existing] = await db
    .select()
    .from(endorsement)
    .where(and(eq(endorsement.endeavorId, id), eq(endorsement.authorId, session.user.id)))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "You have already endorsed this endeavor" }, { status: 409 });
  }

  const body = await request.json();
  const { content, rating } = body;

  if (!content?.trim() || content.trim().length > 500) {
    return NextResponse.json({ error: "Content required (max 500 chars)" }, { status: 400 });
  }

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const [created] = await db
    .insert(endorsement)
    .values({
      endeavorId: id,
      authorId: session.user.id,
      content: content.trim(),
      rating,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
