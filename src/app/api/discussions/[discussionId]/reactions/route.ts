import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reaction } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VALID_EMOJIS = ["like", "heart", "fire", "thumbsup", "thumbsdown", "celebrate"];

// GET: returns reaction counts and user's reactions for a discussion
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { discussionId } = await params;

  // Get counts per emoji
  const counts = await db
    .select({
      emoji: reaction.emoji,
      count: sql<number>`count(*)::int`,
    })
    .from(reaction)
    .where(eq(reaction.discussionId, discussionId))
    .groupBy(reaction.emoji);

  // Get user's own reactions
  const userReactions = await db
    .select({ emoji: reaction.emoji })
    .from(reaction)
    .where(
      and(
        eq(reaction.discussionId, discussionId),
        eq(reaction.userId, session.user.id)
      )
    );

  return NextResponse.json({
    counts: counts.reduce(
      (acc, { emoji, count }) => ({ ...acc, [emoji]: count }),
      {} as Record<string, number>
    ),
    userReactions: userReactions.map((r) => r.emoji),
  });
}

// POST: toggle a reaction (add if not exists, remove if exists)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { discussionId } = await params;
  const { emoji } = await request.json();

  if (!emoji || !VALID_EMOJIS.includes(emoji)) {
    return NextResponse.json(
      { error: `Invalid emoji. Must be one of: ${VALID_EMOJIS.join(", ")}` },
      { status: 400 }
    );
  }

  // Check if reaction already exists
  const [existing] = await db
    .select()
    .from(reaction)
    .where(
      and(
        eq(reaction.discussionId, discussionId),
        eq(reaction.userId, session.user.id),
        eq(reaction.emoji, emoji)
      )
    )
    .limit(1);

  if (existing) {
    // Remove it
    await db.delete(reaction).where(eq(reaction.id, existing.id));
    return NextResponse.json({ action: "removed", emoji });
  } else {
    // Add it
    const [created] = await db
      .insert(reaction)
      .values({
        discussionId,
        userId: session.user.id,
        emoji,
      })
      .returning();
    return NextResponse.json({ action: "added", emoji, reaction: created });
  }
}
