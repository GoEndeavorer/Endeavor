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

  // Verify question author
  const q = await db.execute(sql`
    SELECT author_id FROM question WHERE id = ${questionId}
  `);

  if (q.rows.length === 0) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if ((q.rows[0] as { author_id: string }).author_id !== session.user.id) {
    return NextResponse.json({ error: "Only the question author can accept answers" }, { status: 403 });
  }

  const { answerId } = await request.json();

  // Unaccept all answers for this question, then accept the chosen one
  await db.execute(sql`
    UPDATE answer SET accepted = false WHERE question_id = ${questionId}
  `);

  await db.execute(sql`
    UPDATE answer SET accepted = true WHERE id = ${answerId} AND question_id = ${questionId}
  `);

  await db.execute(sql`
    UPDATE question SET solved = true, accepted_answer_id = ${answerId} WHERE id = ${questionId}
  `);

  return NextResponse.json({ ok: true });
}
