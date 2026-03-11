import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { poll, pollVote, member } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST — cast a vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const { pollId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the poll
  const [thePoll] = await db
    .select()
    .from(poll)
    .where(eq(poll.id, pollId))
    .limit(1);

  if (!thePoll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  if (thePoll.status === "closed") {
    return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
  }

  if (thePoll.endsAt && thePoll.endsAt < new Date()) {
    return NextResponse.json({ error: "Poll has ended" }, { status: 400 });
  }

  // Verify membership in the endeavor
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, thePoll.endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { optionIndex } = await request.json();

  if (typeof optionIndex !== "number" || optionIndex < 0 || optionIndex >= thePoll.options.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  // Check if already voted
  const existing = await db
    .select()
    .from(pollVote)
    .where(
      and(eq(pollVote.pollId, pollId), eq(pollVote.userId, session.user.id))
    )
    .limit(1);

  if (existing.length > 0) {
    // Update vote
    await db
      .update(pollVote)
      .set({ optionIndex })
      .where(eq(pollVote.id, existing[0].id));
  } else {
    // Insert new vote
    await db.insert(pollVote).values({
      pollId,
      userId: session.user.id,
      optionIndex,
    });
  }

  return NextResponse.json({ success: true });
}
