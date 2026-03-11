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
  const context = searchParams.get("context") || "profile";

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pinned_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      context TEXT NOT NULL DEFAULT 'profile',
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, content_type, content_id, context)
    )
  `);

  const result = await db.execute(sql`
    SELECT * FROM pinned_content
    WHERE user_id = ${session.user.id} AND context = ${context}
    ORDER BY display_order ASC, created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentType, contentId, context } = await request.json();

  if (!contentType || !contentId) {
    return NextResponse.json({ error: "Content type and ID required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pinned_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      context TEXT NOT NULL DEFAULT 'profile',
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, content_type, content_id, context)
    )
  `);

  await db.execute(sql`
    INSERT INTO pinned_content (user_id, content_type, content_id, context)
    VALUES (${session.user.id}, ${contentType}, ${contentId}, ${context || "profile"})
    ON CONFLICT (user_id, content_type, content_id, context) DO NOTHING
  `);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  await db.execute(sql`
    DELETE FROM pinned_content WHERE id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}
