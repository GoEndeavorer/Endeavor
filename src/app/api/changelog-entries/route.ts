import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");
  if (!endeavorId) return NextResponse.json({ error: "endeavorId required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS changelog_entry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      version TEXT,
      title TEXT NOT NULL,
      body TEXT,
      type TEXT NOT NULL DEFAULT 'update',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT ce.*, u.name as author_name
    FROM changelog_entry ce
    JOIN "user" u ON ce.author_id = u.id
    WHERE ce.endeavor_id = ${endeavorId}
    ORDER BY ce.created_at DESC
    LIMIT 30
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endeavorId, version, title, body, type } = await request.json();
  if (!endeavorId || !title?.trim()) {
    return NextResponse.json({ error: "Endeavor and title required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS changelog_entry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      version TEXT,
      title TEXT NOT NULL,
      body TEXT,
      type TEXT NOT NULL DEFAULT 'update',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const validTypes = ["feature", "fix", "improvement", "breaking", "update"];
  const result = await db.execute(sql`
    INSERT INTO changelog_entry (endeavor_id, author_id, version, title, body, type)
    VALUES (${endeavorId}, ${session.user.id}, ${version || null}, ${title.trim()}, ${body || null}, ${validTypes.includes(type) ? type : "update"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
