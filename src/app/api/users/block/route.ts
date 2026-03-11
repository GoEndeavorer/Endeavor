import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_block (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      blocker_id TEXT NOT NULL,
      blocked_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(blocker_id, blocked_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT ub.*, u.name as blocked_name, u.image as blocked_image
    FROM user_block ub
    JOIN "user" u ON ub.blocked_id = u.id
    WHERE ub.blocker_id = ${session.user.id}
    ORDER BY ub.created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
  if (userId === session.user.id) return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_block (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      blocker_id TEXT NOT NULL,
      blocked_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(blocker_id, blocked_id)
    )
  `);

  await db.execute(sql`
    INSERT INTO user_block (blocker_id, blocked_id)
    VALUES (${session.user.id}, ${userId})
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING
  `);

  // Also unfollow if following
  await db.execute(sql`
    DELETE FROM follow WHERE follower_id = ${session.user.id} AND following_id = ${userId}
  `);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  await db.execute(sql`
    DELETE FROM user_block WHERE blocker_id = ${session.user.id} AND blocked_id = ${userId}
  `);

  return NextResponse.json({ ok: true });
}
