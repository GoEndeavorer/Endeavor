import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list resources/links for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_resource (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      added_by TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      description TEXT,
      resource_type TEXT NOT NULL DEFAULT 'link',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      r.*,
      u.name as added_by_name
    FROM endeavor_resource r
    JOIN "user" u ON r.added_by = u.id
    WHERE r.endeavor_id = ${id}
    ORDER BY r.created_at DESC
  `);

  return NextResponse.json(result.rows);
}

// POST - add a resource
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, url, description, resourceType } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_resource (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      added_by TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      description TEXT,
      resource_type TEXT NOT NULL DEFAULT 'link',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO endeavor_resource (endeavor_id, added_by, title, url, description, resource_type)
    VALUES (${id}, ${session.user.id}, ${title.trim()}, ${url || null}, ${description || null}, ${resourceType || "link"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

// DELETE - remove a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resourceId } = await request.json();

  // Only creator or the person who added it can delete
  const resource = await db.execute(sql`
    SELECT r.added_by, e.creator_id
    FROM endeavor_resource r
    JOIN endeavor e ON r.endeavor_id = e.id
    WHERE r.id = ${resourceId} AND r.endeavor_id = ${id}
  `);

  if (resource.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const r = resource.rows[0] as { added_by: string; creator_id: string };
  if (r.added_by !== session.user.id && r.creator_id !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await db.execute(sql`DELETE FROM endeavor_resource WHERE id = ${resourceId}`);
  return NextResponse.json({ success: true });
}
