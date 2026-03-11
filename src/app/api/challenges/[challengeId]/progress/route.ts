import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { progress } = await request.json();
  const progressVal = Math.min(100, Math.max(0, Number(progress) || 0));
  const completed = progressVal >= 100;

  await db.execute(sql`
    UPDATE challenge_participant
    SET progress = ${progressVal},
        completed = ${completed},
        completed_at = ${completed ? new Date().toISOString() : null}
    WHERE challenge_id = ${challengeId} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ progress: progressVal, completed });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;

  const result = await db.execute(sql`
    SELECT cp.*, u.name as user_name, u.image as user_image
    FROM challenge_participant cp
    JOIN "user" u ON cp.user_id = u.id
    WHERE cp.challenge_id = ${challengeId}
    ORDER BY cp.progress DESC, cp.joined_at ASC
  `);

  return NextResponse.json(result.rows);
}
