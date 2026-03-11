import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS api_key (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      scopes TEXT[] NOT NULL DEFAULT '{}',
      last_used TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT id, name, key_prefix, scopes, last_used, expires_at, created_at
    FROM api_key
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, scopes, expiresIn } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS api_key (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      scopes TEXT[] NOT NULL DEFAULT '{}',
      last_used TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Generate key
  const rawKey = `edv_${crypto.randomBytes(32).toString("hex")}`;
  const keyPrefix = rawKey.substring(0, 12);
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  let expiresAt = null;
  if (expiresIn === "30d") expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
  else if (expiresIn === "90d") expiresAt = new Date(Date.now() + 90 * 86400000).toISOString();
  else if (expiresIn === "1y") expiresAt = new Date(Date.now() + 365 * 86400000).toISOString();

  const validScopes = ["read", "write", "admin"];
  const filteredScopes = (scopes || ["read"]).filter((s: string) => validScopes.includes(s));

  const result = await db.execute(sql`
    INSERT INTO api_key (user_id, name, key_prefix, key_hash, scopes, expires_at)
    VALUES (${session.user.id}, ${name.trim()}, ${keyPrefix}, ${keyHash}, ${filteredScopes}, ${expiresAt})
    RETURNING id, name, key_prefix, scopes, expires_at, created_at
  `);

  // Return the full key ONLY on creation
  return NextResponse.json({ ...result.rows[0], key: rawKey }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Key id required" }, { status: 400 });

  await db.execute(sql`DELETE FROM api_key WHERE id = ${id} AND user_id = ${session.user.id}`);
  return NextResponse.json({ success: true });
}
