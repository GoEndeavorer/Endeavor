import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET reactions for a target
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!targetType || !targetId) {
    return NextResponse.json({ error: "targetType and targetId required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reaction (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, target_type, target_id, emoji)
    )
  `);

  const result = await db.execute(sql`
    SELECT emoji, COUNT(*)::int as count,
      array_agg(u.name) as user_names
    FROM reaction r
    JOIN "user" u ON r.user_id = u.id
    WHERE r.target_type = ${targetType} AND r.target_id = ${targetId}
    GROUP BY emoji
    ORDER BY count DESC
  `);

  return NextResponse.json(result.rows);
}

// POST toggle a reaction
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetType, targetId, emoji } = await request.json();

  if (!targetType || !targetId || !emoji) {
    return NextResponse.json({ error: "targetType, targetId, and emoji required" }, { status: 400 });
  }

  const validEmojis = ["👍", "❤️", "🎉", "🚀", "👀", "💡", "🔥", "👏"];
  if (!validEmojis.includes(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reaction (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, target_type, target_id, emoji)
    )
  `);

  // Toggle
  const existing = await db.execute(sql`
    SELECT id FROM reaction
    WHERE user_id = ${session.user.id} AND target_type = ${targetType}
      AND target_id = ${targetId} AND emoji = ${emoji}
  `);

  if (existing.rows.length > 0) {
    await db.execute(sql`
      DELETE FROM reaction
      WHERE user_id = ${session.user.id} AND target_type = ${targetType}
        AND target_id = ${targetId} AND emoji = ${emoji}
    `);
    return NextResponse.json({ action: "removed" });
  } else {
    await db.execute(sql`
      INSERT INTO reaction (user_id, target_type, target_id, emoji)
      VALUES (${session.user.id}, ${targetType}, ${targetId}, ${emoji})
    `);
    return NextResponse.json({ action: "added" });
  }
}
