import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_watcher (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT ew.*, u.name, u.image
    FROM endeavor_watcher ew
    JOIN "user" u ON ew.user_id = u.id
    WHERE ew.endeavor_id = ${id}
    ORDER BY ew.created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_watcher (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id)
    )
  `);

  await db.execute(sql`
    INSERT INTO endeavor_watcher (endeavor_id, user_id)
    VALUES (${id}, ${session.user.id})
    ON CONFLICT (endeavor_id, user_id) DO NOTHING
  `);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    DELETE FROM endeavor_watcher WHERE endeavor_id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}
