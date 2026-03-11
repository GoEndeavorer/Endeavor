import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userIds = searchParams.get("userIds");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_presence (
      user_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'online',
      status_message TEXT,
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  if (userIds) {
    const ids = userIds.split(",").map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) return NextResponse.json([]);

    const result = await db.execute(sql`
      SELECT up.*, u.name, u.image
      FROM user_presence up
      JOIN "user" u ON up.user_id = u.id
      WHERE up.user_id = ANY(${ids})
    `);
    return NextResponse.json(result.rows);
  }

  // Return recently active users (last 15 minutes)
  const result = await db.execute(sql`
    SELECT up.*, u.name, u.image
    FROM user_presence up
    JOIN "user" u ON up.user_id = u.id
    WHERE up.last_seen > NOW() - INTERVAL '15 minutes'
    ORDER BY up.last_seen DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status, statusMessage } = await request.json();

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_presence (
      user_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'online',
      status_message TEXT,
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    INSERT INTO user_presence (user_id, status, status_message, last_seen)
    VALUES (${session.user.id}, ${status || "online"}, ${statusMessage || null}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      status = EXCLUDED.status,
      status_message = COALESCE(EXCLUDED.status_message, user_presence.status_message),
      last_seen = NOW()
  `);

  return NextResponse.json({ success: true });
}
