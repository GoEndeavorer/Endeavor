import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list announcements for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS announcement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      pinned BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      a.*,
      u.name as author_name,
      u.image as author_image
    FROM announcement a
    JOIN "user" u ON a.author_id = u.id
    WHERE a.endeavor_id = ${id}
    ORDER BY a.pinned DESC, a.created_at DESC
    LIMIT 20
  `);

  return NextResponse.json(result.rows);
}

// POST - create an announcement (creator/admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify creator or admin
  const endeavor = await db.execute(sql`
    SELECT creator_id FROM endeavor WHERE id = ${id}
  `);
  if (endeavor.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isCreator = (endeavor.rows[0] as { creator_id: string }).creator_id === session.user.id;

  const memberRole = await db.execute(sql`
    SELECT role FROM member WHERE endeavor_id = ${id} AND user_id = ${session.user.id} AND status = 'approved'
  `);
  const role = memberRole.rows[0] as { role: string } | undefined;
  const isAdmin = role?.role === "admin" || role?.role === "moderator";

  if (!isCreator && !isAdmin) {
    return NextResponse.json({ error: "Only creators and admins can post announcements" }, { status: 403 });
  }

  const { title, content, priority, pinned } = await request.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS announcement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      pinned BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO announcement (endeavor_id, author_id, title, content, priority, pinned)
    VALUES (${id}, ${session.user.id}, ${title.trim()}, ${content.trim()}, ${priority || "normal"}, ${pinned || false})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
