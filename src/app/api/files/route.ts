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
  const folder = searchParams.get("folder");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS shared_file (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      uploader_id TEXT NOT NULL,
      endeavor_id UUID,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'file',
      size_bytes BIGINT DEFAULT 0,
      folder TEXT DEFAULT '/',
      download_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT sf.*, u.name as uploader_name
      FROM shared_file sf
      JOIN "user" u ON sf.uploader_id = u.id
      WHERE sf.endeavor_id = ${endeavorId}
      ${folder ? sql`AND sf.folder = ${folder}` : sql``}
      ORDER BY sf.type = 'folder' DESC, sf.name ASC
    `);
  } else {
    result = await db.execute(sql`
      SELECT sf.*, u.name as uploader_name
      FROM shared_file sf
      JOIN "user" u ON sf.uploader_id = u.id
      WHERE sf.uploader_id = ${session.user.id}
      ${folder ? sql`AND sf.folder = ${folder}` : sql``}
      ORDER BY sf.type = 'folder' DESC, sf.name ASC
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, url, type, sizeBytes, folder, endeavorId } = await request.json();
  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "Name and URL required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS shared_file (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      uploader_id TEXT NOT NULL,
      endeavor_id UUID,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'file',
      size_bytes BIGINT DEFAULT 0,
      folder TEXT DEFAULT '/',
      download_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO shared_file (uploader_id, endeavor_id, name, url, type, size_bytes, folder)
    VALUES (${session.user.id}, ${endeavorId || null}, ${name.trim()}, ${url.trim()}, ${type || "file"}, ${sizeBytes || 0}, ${folder || "/"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");
  if (!fileId) return NextResponse.json({ error: "File id required" }, { status: 400 });

  await db.execute(sql`
    DELETE FROM shared_file WHERE id = ${fileId} AND uploader_id = ${session.user.id}
  `);

  return NextResponse.json({ success: true });
}
