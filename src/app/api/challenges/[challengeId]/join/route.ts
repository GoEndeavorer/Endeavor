import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check capacity
  const challenge = await db.execute(sql`
    SELECT max_participants, participant_count FROM challenge WHERE id = ${challengeId}
  `);

  if (challenge.rows.length === 0) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const c = challenge.rows[0] as { max_participants: number | null; participant_count: number };
  if (c.max_participants && c.participant_count >= c.max_participants) {
    return NextResponse.json({ error: "Challenge is full" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS challenge_participant (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      challenge_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      progress INT NOT NULL DEFAULT 0,
      completed BOOLEAN NOT NULL DEFAULT false,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      UNIQUE(challenge_id, user_id)
    )
  `);

  await db.execute(sql`
    INSERT INTO challenge_participant (challenge_id, user_id)
    VALUES (${challengeId}, ${session.user.id})
    ON CONFLICT (challenge_id, user_id) DO NOTHING
  `);

  await db.execute(sql`
    UPDATE challenge SET participant_count = (
      SELECT COUNT(*) FROM challenge_participant WHERE challenge_id = ${challengeId}
    ) WHERE id = ${challengeId}
  `);

  return NextResponse.json({ ok: true });
}
