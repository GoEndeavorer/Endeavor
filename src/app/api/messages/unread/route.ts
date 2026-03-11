import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET — total unread message count across all conversations
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  const userId = session.user.id;

  const result = await db.execute(sql`
    SELECT COALESCE(SUM(unread)::int, 0) AS count
    FROM (
      SELECT (
        SELECT COUNT(*)::int
        FROM message m
        WHERE m.conversation_id = cp.conversation_id
          AND m.sender_id != ${userId}
          AND m.created_at > cp.last_read_at
      ) AS unread
      FROM conversation_participant cp
      WHERE cp.user_id = ${userId}
    ) sub
  `);

  const row = result.rows[0] as { count: number } | undefined;
  return NextResponse.json({ count: row?.count ?? 0 });
}
