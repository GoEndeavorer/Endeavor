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
  const type = searchParams.get("type");
  const endeavorId = searchParams.get("endeavorId");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS media_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'image',
      size_bytes INT,
      alt_text TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT * FROM media_item
      WHERE user_id = ${session.user.id} AND endeavor_id = ${endeavorId}
      ORDER BY created_at DESC LIMIT 100
    `);
  } else if (type) {
    result = await db.execute(sql`
      SELECT * FROM media_item
      WHERE user_id = ${session.user.id} AND type = ${type}
      ORDER BY created_at DESC LIMIT 100
    `);
  } else {
    result = await db.execute(sql`
      SELECT * FROM media_item
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC LIMIT 100
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, url, type, sizeBytes, altText, endeavorId } = await request.json();

  if (!filename || !url) {
    return NextResponse.json({ error: "Filename and URL required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS media_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'image',
      size_bytes INT,
      alt_text TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO media_item (user_id, endeavor_id, filename, url, type, size_bytes, alt_text)
    VALUES (${session.user.id}, ${endeavorId || null}, ${filename}, ${url}, ${type || "image"}, ${sizeBytes || null}, ${altText || null})
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
    DELETE FROM media_item WHERE id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}
