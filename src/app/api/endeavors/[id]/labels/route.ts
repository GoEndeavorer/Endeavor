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
    CREATE TABLE IF NOT EXISTS endeavor_label (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#00FF00',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, name)
    )
  `);

  const result = await db.execute(sql`
    SELECT * FROM endeavor_label
    WHERE endeavor_id = ${id}
    ORDER BY name ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, color } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_label (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#00FF00',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, name)
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO endeavor_label (endeavor_id, name, color)
    VALUES (${id}, ${name.trim()}, ${color || "#00FF00"})
    ON CONFLICT (endeavor_id, name) DO UPDATE SET color = EXCLUDED.color
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const labelId = searchParams.get("labelId");

  await db.execute(sql`
    DELETE FROM endeavor_label WHERE id = ${labelId} AND endeavor_id = ${id}
  `);

  return NextResponse.json({ ok: true });
}
