import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_vote (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      item_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(item_id, user_id)
    )
  `);

  // Check existing vote
  const existing = await db.execute(sql`
    SELECT id FROM feedback_vote WHERE item_id = ${itemId} AND user_id = ${session.user.id}
  `);

  if (existing.rows.length > 0) {
    // Remove vote
    await db.execute(sql`DELETE FROM feedback_vote WHERE item_id = ${itemId} AND user_id = ${session.user.id}`);
    await db.execute(sql`UPDATE feedback_item SET vote_count = vote_count - 1 WHERE id = ${itemId}`);
    return NextResponse.json({ action: "unvoted" });
  } else {
    await db.execute(sql`INSERT INTO feedback_vote (item_id, user_id) VALUES (${itemId}, ${session.user.id})`);
    await db.execute(sql`UPDATE feedback_item SET vote_count = vote_count + 1 WHERE id = ${itemId}`);
    return NextResponse.json({ action: "voted" });
  }
}
