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
    CREATE TABLE IF NOT EXISTS endeavor_checklist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      completed_by TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `);

  const result = await db.execute(sql`
    SELECT c.*, u.name as completed_by_name
    FROM endeavor_checklist c
    LEFT JOIN "user" u ON c.completed_by = u.id
    WHERE c.endeavor_id = ${id}
    ORDER BY c.display_order ASC, c.created_at ASC
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

  const { title } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_checklist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      completed_by TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO endeavor_checklist (endeavor_id, title)
    VALUES (${id}, ${title.trim()})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId, completed } = await request.json();

  await db.execute(sql`
    UPDATE endeavor_checklist
    SET completed = ${completed},
        completed_by = ${completed ? session.user.id : null},
        completed_at = ${completed ? new Date().toISOString() : null}
    WHERE id = ${itemId} AND endeavor_id = ${id}
  `);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");

  await db.execute(sql`
    DELETE FROM endeavor_checklist WHERE id = ${itemId} AND endeavor_id = ${id}
  `);

  return NextResponse.json({ ok: true });
}
