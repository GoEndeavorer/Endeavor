import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function ensureTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS playlist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      visibility TEXT NOT NULL DEFAULT 'public',
      item_count INT NOT NULL DEFAULT 0,
      follower_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS playlist_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      playlist_id UUID NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'link',
      display_order INT NOT NULL DEFAULT 0,
      completed_by TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await params;

  await ensureTables();

  const result = await db.execute(sql`
    SELECT * FROM playlist_item
    WHERE playlist_id = ${playlistId}
    ORDER BY display_order ASC, created_at ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user owns this playlist
  const ownerCheck = await db.execute(sql`
    SELECT creator_id FROM playlist WHERE id = ${playlistId}
  `);
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  }
  const playlist = ownerCheck.rows[0] as { creator_id: string };
  if (playlist.creator_id !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { title, url, description, type, displayOrder } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  await ensureTables();

  const result = await db.execute(sql`
    INSERT INTO playlist_item (playlist_id, title, url, description, type, display_order)
    VALUES (
      ${playlistId},
      ${title.trim()},
      ${url?.trim() || null},
      ${description?.trim() || null},
      ${type || "link"},
      ${displayOrder ?? 0}
    )
    RETURNING *
  `);

  // Update item count
  await db.execute(sql`
    UPDATE playlist
    SET item_count = (SELECT COUNT(*) FROM playlist_item WHERE playlist_id = ${playlistId})
    WHERE id = ${playlistId}
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  // Verify the user owns this playlist
  const ownerCheck = await db.execute(sql`
    SELECT creator_id FROM playlist WHERE id = ${playlistId}
  `);
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  }
  const playlist = ownerCheck.rows[0] as { creator_id: string };
  if (playlist.creator_id !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const result = await db.execute(sql`
    DELETE FROM playlist_item
    WHERE id = ${itemId} AND playlist_id = ${playlistId}
    RETURNING id
  `);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Update item count
  await db.execute(sql`
    UPDATE playlist
    SET item_count = (SELECT COUNT(*) FROM playlist_item WHERE playlist_id = ${playlistId})
    WHERE id = ${playlistId}
  `);

  return NextResponse.json({ deleted: true });
}
