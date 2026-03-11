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
    CREATE TABLE IF NOT EXISTS user_preference (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE,
      theme TEXT NOT NULL DEFAULT 'dark',
      language TEXT NOT NULL DEFAULT 'en',
      timezone TEXT NOT NULL DEFAULT 'UTC',
      email_digest TEXT NOT NULL DEFAULT 'weekly',
      show_online_status BOOLEAN NOT NULL DEFAULT true,
      show_activity BOOLEAN NOT NULL DEFAULT true,
      allow_messages TEXT NOT NULL DEFAULT 'everyone',
      default_endeavor_visibility TEXT NOT NULL DEFAULT 'public',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT * FROM user_preference WHERE user_id = ${session.user.id}
  `);

  if (result.rows.length === 0) {
    // Return defaults
    return NextResponse.json({
      theme: "dark",
      language: "en",
      timezone: "UTC",
      email_digest: "weekly",
      show_online_status: true,
      show_activity: true,
      allow_messages: "everyone",
      default_endeavor_visibility: "public",
    });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await request.json();

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_preference (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE,
      theme TEXT NOT NULL DEFAULT 'dark',
      language TEXT NOT NULL DEFAULT 'en',
      timezone TEXT NOT NULL DEFAULT 'UTC',
      email_digest TEXT NOT NULL DEFAULT 'weekly',
      show_online_status BOOLEAN NOT NULL DEFAULT true,
      show_activity BOOLEAN NOT NULL DEFAULT true,
      allow_messages TEXT NOT NULL DEFAULT 'everyone',
      default_endeavor_visibility TEXT NOT NULL DEFAULT 'public',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    INSERT INTO user_preference (user_id, theme, language, timezone, email_digest, show_online_status, show_activity, allow_messages, default_endeavor_visibility)
    VALUES (
      ${session.user.id},
      ${prefs.theme || "dark"},
      ${prefs.language || "en"},
      ${prefs.timezone || "UTC"},
      ${prefs.email_digest || "weekly"},
      ${prefs.show_online_status !== false},
      ${prefs.show_activity !== false},
      ${prefs.allow_messages || "everyone"},
      ${prefs.default_endeavor_visibility || "public"}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      theme = EXCLUDED.theme,
      language = EXCLUDED.language,
      timezone = EXCLUDED.timezone,
      email_digest = EXCLUDED.email_digest,
      show_online_status = EXCLUDED.show_online_status,
      show_activity = EXCLUDED.show_activity,
      allow_messages = EXCLUDED.allow_messages,
      default_endeavor_visibility = EXCLUDED.default_endeavor_visibility,
      updated_at = NOW()
  `);

  return NextResponse.json({ ok: true });
}
