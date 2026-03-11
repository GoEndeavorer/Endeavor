import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { poll, pollVote, member, user } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list polls for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const polls = await db
    .select({
      id: poll.id,
      question: poll.question,
      options: poll.options,
      status: poll.status,
      endsAt: poll.endsAt,
      authorId: poll.authorId,
      authorName: user.name,
      createdAt: poll.createdAt,
      totalVotes: sql<number>`(SELECT COUNT(*) FROM poll_vote WHERE poll_vote.poll_id = ${poll.id})`,
    })
    .from(poll)
    .innerJoin(user, eq(poll.authorId, user.id))
    .where(eq(poll.endeavorId, endeavorId))
    .orderBy(desc(poll.createdAt));

  // Get vote counts per option and user's vote for each poll
  const enriched = await Promise.all(
    polls.map(async (p) => {
      const votes = await db
        .select({
          optionIndex: pollVote.optionIndex,
          count: sql<number>`count(*)`,
        })
        .from(pollVote)
        .where(eq(pollVote.pollId, p.id))
        .groupBy(pollVote.optionIndex);

      const userVote = await db
        .select({ optionIndex: pollVote.optionIndex })
        .from(pollVote)
        .where(
          and(eq(pollVote.pollId, p.id), eq(pollVote.userId, session.user.id))
        )
        .limit(1);

      const voteCounts: Record<number, number> = {};
      votes.forEach((v) => {
        voteCounts[v.optionIndex] = Number(v.count);
      });

      return {
        ...p,
        voteCounts,
        userVote: userVote.length > 0 ? userVote[0].optionIndex : null,
      };
    })
  );

  return NextResponse.json(enriched);
}

// POST — create a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { question, options, endsAt } = await request.json();

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json({ error: "Question required" }, { status: 400 });
  }

  if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
    return NextResponse.json(
      { error: "2-10 options required" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(poll)
    .values({
      endeavorId,
      authorId: session.user.id,
      question: question.trim(),
      options: options.map((o: string) => o.trim()),
      endsAt: endsAt ? new Date(endsAt) : null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
