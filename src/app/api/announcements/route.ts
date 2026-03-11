import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ensureTable = () =>
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS announcement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      pinned BOOLEAN NOT NULL DEFAULT false,
      target TEXT NOT NULL DEFAULT 'all',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

export async function GET() {
  await ensureTable();

  const result = await db.execute(sql`
    SELECT a.*, u.name as author_name, u.image as author_image
    FROM announcement a
    JOIN "user" u ON a.author_id = u.id
    ORDER BY a.pinned DESC, a.created_at DESC
    LIMIT 100
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, priority, pinned, target } = await request.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO announcement (author_id, title, body, priority, pinned, target)
    VALUES (
      ${session.user.id},
      ${title.trim()},
      ${body.trim()},
      ${priority || "normal"},
      ${pinned || false},
      ${target || "all"}
    )
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
