import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - retrieve user preferences
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_preference (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, key)
    )
  `);

  const result = await db.execute(sql`
    SELECT key, value FROM user_preference
    WHERE user_id = ${session.user.id}
  `);

  const preferences: Record<string, string> = {};
  for (const row of result.rows as { key: string; value: string }[]) {
    preferences[row.key] = row.value;
  }

  return NextResponse.json(preferences);
}

// POST - update a preference
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, value } = await request.json();
  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  const validKeys = [
    "theme", "compact_mode", "notification_sounds", "email_digest",
    "language", "timezone", "show_online_status", "default_feed_sort",
  ];

  if (!validKeys.includes(key)) {
    return NextResponse.json({ error: `Invalid preference key. Must be one of: ${validKeys.join(", ")}` }, { status: 400 });
  }

  await db.execute(sql`
    INSERT INTO user_preference (user_id, key, value, updated_at)
    VALUES (${session.user.id}, ${key}, ${String(value)}, NOW())
    ON CONFLICT (user_id, key) DO UPDATE SET value = ${String(value)}, updated_at = NOW()
  `);

  return NextResponse.json({ success: true, key, value });
}
