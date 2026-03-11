import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// POST - toggle vote on feedback
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.execute(sql`
    SELECT id FROM feedback_vote WHERE feedback_id = ${feedbackId} AND user_id = ${session.user.id}
  `);

  if (existing.rows.length > 0) {
    await db.execute(sql`
      DELETE FROM feedback_vote WHERE feedback_id = ${feedbackId} AND user_id = ${session.user.id}
    `);
    await db.execute(sql`
      UPDATE platform_feedback SET votes = votes - 1 WHERE id = ${feedbackId}
    `);
    return NextResponse.json({ voted: false });
  }

  await db.execute(sql`
    INSERT INTO feedback_vote (feedback_id, user_id) VALUES (${feedbackId}, ${session.user.id})
  `);
  await db.execute(sql`
    UPDATE platform_feedback SET votes = votes + 1 WHERE id = ${feedbackId}
  `);

  return NextResponse.json({ voted: true });
}
