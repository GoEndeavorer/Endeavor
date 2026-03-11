import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_note (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT,
      content TEXT NOT NULL,
      pinned BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT * FROM user_note
      WHERE user_id = ${session.user.id} AND endeavor_id = ${endeavorId}
      ORDER BY pinned DESC, updated_at DESC LIMIT 100
    `);
  } else {
    result = await db.execute(sql`
      SELECT * FROM user_note
      WHERE user_id = ${session.user.id}
      ORDER BY pinned DESC, updated_at DESC LIMIT 100
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, endeavorId, pinned } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_note (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT,
      content TEXT NOT NULL,
      pinned BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO user_note (user_id, endeavor_id, title, content, pinned)
    VALUES (${session.user.id}, ${endeavorId || null}, ${title || null}, ${content.trim()}, ${pinned || false})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, content, pinned } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updates: string[] = [];
  if (title !== undefined) updates.push(`title = '${title}'`);
  if (content !== undefined) updates.push(`content = '${content}'`);
  if (pinned !== undefined) updates.push(`pinned = ${pinned}`);
  updates.push("updated_at = NOW()");

  await db.execute(
    sql.raw(`UPDATE user_note SET ${updates.join(", ")} WHERE id = '${id}' AND user_id = '${session.user.id}'`)
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.execute(sql`
    DELETE FROM user_note WHERE id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}
