import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - get pinned items for an endeavor (discussions, milestones, links)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pinned_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      pinned_by TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT,
      title TEXT NOT NULL,
      url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      p.*,
      u.name as pinned_by_name
    FROM pinned_item p
    JOIN "user" u ON p.pinned_by = u.id
    WHERE p.endeavor_id = ${id}
    ORDER BY p.created_at DESC
  `);

  return NextResponse.json(result.rows);
}

// POST - pin an item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemType, itemId, title, url } = await request.json();

  if (!title?.trim() || !itemType) {
    return NextResponse.json({ error: "Title and item type required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pinned_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      pinned_by TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT,
      title TEXT NOT NULL,
      url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO pinned_item (endeavor_id, pinned_by, item_type, item_id, title, url)
    VALUES (${id}, ${session.user.id}, ${itemType}, ${itemId || null}, ${title.trim()}, ${url || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

// DELETE - unpin an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pinnedId } = await request.json();

  // Only creator or person who pinned can unpin
  const item = await db.execute(sql`
    SELECT p.pinned_by, e.creator_id
    FROM pinned_item p
    JOIN endeavor e ON p.endeavor_id = e.id
    WHERE p.id = ${pinnedId} AND p.endeavor_id = ${id}
  `);

  if (item.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = item.rows[0] as { pinned_by: string; creator_id: string };
  if (row.pinned_by !== session.user.id && row.creator_id !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await db.execute(sql`DELETE FROM pinned_item WHERE id = ${pinnedId}`);
  return NextResponse.json({ success: true });
}
