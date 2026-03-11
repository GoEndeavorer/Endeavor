import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// POST - vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // consume params
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pollId, optionIndex } = await request.json();

  if (!pollId || optionIndex === undefined) {
    return NextResponse.json({ error: "pollId and optionIndex required" }, { status: 400 });
  }

  // Check poll exists and not expired
  const poll = await db.execute(sql`
    SELECT * FROM poll WHERE id = ${pollId}
  `);

  if (poll.rows.length === 0) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  const p = poll.rows[0] as { expires_at: string | null; allow_multiple: boolean; options: string[] };

  if (p.expires_at && new Date(p.expires_at) < new Date()) {
    return NextResponse.json({ error: "Poll has expired" }, { status: 400 });
  }

  if (optionIndex < 0 || optionIndex >= p.options.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  // If not allowing multiple, remove existing vote first
  if (!p.allow_multiple) {
    await db.execute(sql`
      DELETE FROM poll_vote WHERE poll_id = ${pollId} AND user_id = ${session.user.id}
    `);
  }

  // Toggle vote
  const existing = await db.execute(sql`
    SELECT id FROM poll_vote
    WHERE poll_id = ${pollId} AND user_id = ${session.user.id} AND option_index = ${optionIndex}
  `);

  if (existing.rows.length > 0) {
    await db.execute(sql`
      DELETE FROM poll_vote
      WHERE poll_id = ${pollId} AND user_id = ${session.user.id} AND option_index = ${optionIndex}
    `);
    return NextResponse.json({ voted: false });
  }

  await db.execute(sql`
    INSERT INTO poll_vote (poll_id, user_id, option_index)
    VALUES (${pollId}, ${session.user.id}, ${optionIndex})
  `);

  return NextResponse.json({ voted: true });
}
