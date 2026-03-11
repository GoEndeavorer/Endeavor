import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// POST — cast or toggle a vote on a poll
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
  const pollResult = await db.execute(sql`
    SELECT * FROM poll WHERE id = ${pollId} LIMIT 1
  `);

  if (pollResult.rows.length === 0) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  const thePoll = pollResult.rows[0] as {
    id: string;
    status: string;
    type: string;
    expires_at: string | null;
  };

  if (thePoll.status === "closed") {
    return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
  }

  if (thePoll.expires_at && new Date(thePoll.expires_at) < new Date()) {
    return NextResponse.json({ error: "Poll has expired" }, { status: 400 });
  }

  const { optionId } = await request.json();
  if (!optionId) {
    return NextResponse.json(
      { error: "optionId required" },
      { status: 400 }
    );
  }

  // Verify option belongs to this poll
  const optionResult = await db.execute(sql`
    SELECT id FROM poll_option WHERE id = ${optionId} AND poll_id = ${pollId}
  `);
  if (optionResult.rows.length === 0) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  if (thePoll.type === "single") {
    // Single-choice: remove any existing votes first
    const existingVotes = await db.execute(sql`
      SELECT pv.id, pv.option_id FROM poll_vote pv
      WHERE pv.poll_id = ${pollId} AND pv.voter_id = ${session.user.id}
    `);

    for (const v of existingVotes.rows as { id: string; option_id: string }[]) {
      await db.execute(sql`
        DELETE FROM poll_vote WHERE id = ${v.id}
      `);
      await db.execute(sql`
        UPDATE poll_option SET vote_count = GREATEST(vote_count - 1, 0)
        WHERE id = ${v.option_id}
      `);
    }

    // Insert new vote
    await db.execute(sql`
      INSERT INTO poll_vote (poll_id, option_id, voter_id)
      VALUES (${pollId}, ${optionId}, ${session.user.id})
    `);
    await db.execute(sql`
      UPDATE poll_option SET vote_count = vote_count + 1
      WHERE id = ${optionId}
    `);
  } else {
    // Multiple-choice: toggle vote on/off
    const existing = await db.execute(sql`
      SELECT id FROM poll_vote
      WHERE poll_id = ${pollId}
        AND option_id = ${optionId}
        AND voter_id = ${session.user.id}
    `);

    if ((existing.rows as { id: string }[]).length > 0) {
      // Remove vote
      await db.execute(sql`
        DELETE FROM poll_vote
        WHERE poll_id = ${pollId}
          AND option_id = ${optionId}
          AND voter_id = ${session.user.id}
      `);
      await db.execute(sql`
        UPDATE poll_option SET vote_count = GREATEST(vote_count - 1, 0)
        WHERE id = ${optionId}
      `);
    } else {
      // Add vote
      await db.execute(sql`
        INSERT INTO poll_vote (poll_id, option_id, voter_id)
        VALUES (${pollId}, ${optionId}, ${session.user.id})
      `);
      await db.execute(sql`
        UPDATE poll_option SET vote_count = vote_count + 1
        WHERE id = ${optionId}
      `);
    }
  }

  // Return updated options
  const updatedOptions = await db.execute(sql`
    SELECT id, label, vote_count, display_order
    FROM poll_option WHERE poll_id = ${pollId}
    ORDER BY display_order ASC
  `);

  const userVotesResult = await db.execute(sql`
    SELECT option_id FROM poll_vote
    WHERE poll_id = ${pollId} AND voter_id = ${session.user.id}
  `);

  return NextResponse.json({
    options: updatedOptions.rows,
    userVotes: (userVotesResult.rows as { option_id: string }[]).map(
      (v) => v.option_id
    ),
  });
}
