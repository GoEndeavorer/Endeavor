import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS gallery_image (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      uploaded_by TEXT NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await ensureTable();

  const result = await db.execute(sql`
    SELECT gi.*, u.name as uploader_name, u.image as uploader_image
    FROM gallery_image gi
    JOIN "user" u ON gi.uploaded_by = u.id
    WHERE gi.endeavor_id = ${id}
    ORDER BY gi.display_order ASC, gi.created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, caption, displayOrder } = await request.json();
  if (!url?.trim()) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO gallery_image (endeavor_id, uploaded_by, url, caption, display_order)
    VALUES (${id}, ${session.user.id}, ${url.trim()}, ${caption?.trim() || null}, ${displayOrder ?? 0})
    RETURNING *
  `);

  const image = result.rows[0] as Record<string, unknown>;

  return NextResponse.json(
    { ...image, uploader_name: session.user.name, uploader_image: session.user.image },
    { status: 201 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("imageId");
  if (!imageId) {
    return NextResponse.json({ error: "imageId is required" }, { status: 400 });
  }

  await ensureTable();

  // Only the uploader can delete their image
  const result = await db.execute(sql`
    DELETE FROM gallery_image
    WHERE id = ${imageId}
      AND endeavor_id = ${id}
      AND uploaded_by = ${session.user.id}
    RETURNING id
  `);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Image not found or not authorized" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
