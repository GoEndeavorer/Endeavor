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
    CREATE TABLE IF NOT EXISTS saved_search (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      query TEXT NOT NULL,
      filters JSONB DEFAULT '{}',
      notify BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT * FROM saved_search
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, query, filters, notify } = await request.json();

  if (!name?.trim() || !query?.trim()) {
    return NextResponse.json({ error: "Name and query required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS saved_search (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      query TEXT NOT NULL,
      filters JSONB DEFAULT '{}',
      notify BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO saved_search (user_id, name, query, filters, notify)
    VALUES (${session.user.id}, ${name.trim()}, ${query.trim()}, ${JSON.stringify(filters || {})}, ${notify || false})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.execute(sql`
    DELETE FROM saved_search WHERE id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}
