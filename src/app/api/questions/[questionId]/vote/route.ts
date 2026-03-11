import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetType, targetId, direction } = await request.json();

  if (!["question", "answer"].includes(targetType) || !["up", "down"].includes(direction)) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS qa_vote (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id UUID NOT NULL,
      direction TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, target_type, target_id)
    )
  `);

  // Check existing vote
  const existing = await db.execute(sql`
    SELECT direction FROM qa_vote
    WHERE user_id = ${session.user.id} AND target_type = ${targetType} AND target_id = ${targetId}
  `);

  const table = targetType === "question" ? "question" : "answer";
  let delta = 0;

  if (existing.rows.length > 0) {
    const oldDir = (existing.rows[0] as { direction: string }).direction;
    if (oldDir === direction) {
      // Remove vote
      await db.execute(sql`
        DELETE FROM qa_vote WHERE user_id = ${session.user.id} AND target_type = ${targetType} AND target_id = ${targetId}
      `);
      delta = direction === "up" ? -1 : 1;
    } else {
      // Change vote
      await db.execute(sql`
        UPDATE qa_vote SET direction = ${direction}
        WHERE user_id = ${session.user.id} AND target_type = ${targetType} AND target_id = ${targetId}
      `);
      delta = direction === "up" ? 2 : -2;
    }
  } else {
    await db.execute(sql`
      INSERT INTO qa_vote (user_id, target_type, target_id, direction)
      VALUES (${session.user.id}, ${targetType}, ${targetId}, ${direction})
    `);
    delta = direction === "up" ? 1 : -1;
  }

  const result = await db.execute(
    sql.raw(`UPDATE "${table}" SET vote_count = vote_count + ${delta} WHERE id = '${targetId}' RETURNING vote_count`)
  );

  return NextResponse.json({ vote_count: (result.rows[0] as { vote_count: number }).vote_count });
}
