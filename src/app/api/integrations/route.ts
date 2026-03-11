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
    CREATE TABLE IF NOT EXISTS integration (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_user_id TEXT,
      access_token TEXT,
      refresh_token TEXT,
      config JSONB DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, provider)
    )
  `);

  const result = await db.execute(sql`
    SELECT id, provider, provider_user_id, enabled, config, connected_at
    FROM integration
    WHERE user_id = ${session.user.id}
    ORDER BY connected_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider, providerUserId, config } = await request.json();

  if (!provider) {
    return NextResponse.json({ error: "Provider required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS integration (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_user_id TEXT,
      access_token TEXT,
      refresh_token TEXT,
      config JSONB DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, provider)
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO integration (user_id, provider, provider_user_id, config)
    VALUES (${session.user.id}, ${provider}, ${providerUserId || null}, ${JSON.stringify(config || {})})
    ON CONFLICT (user_id, provider) DO UPDATE SET
      provider_user_id = EXCLUDED.provider_user_id,
      config = EXCLUDED.config,
      enabled = true,
      connected_at = NOW()
    RETURNING id, provider, provider_user_id, enabled, config, connected_at
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  if (!provider) return NextResponse.json({ error: "Provider required" }, { status: 400 });

  await db.execute(sql`
    DELETE FROM integration WHERE user_id = ${session.user.id} AND provider = ${provider}
  `);

  return NextResponse.json({ ok: true });
}
