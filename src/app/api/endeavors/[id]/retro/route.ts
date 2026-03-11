import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list retrospective items for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS retro_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      votes INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS retro_vote (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      retro_item_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      UNIQUE(retro_item_id, user_id)
    )
  `);

  const session = await auth.api.getSession({ headers: await headers() });

  const result = await db.execute(sql`
    SELECT
      r.*,
      u.name as author_name,
      ${session ? sql`EXISTS(SELECT 1 FROM retro_vote rv WHERE rv.retro_item_id = r.id AND rv.user_id = ${session.user.id})` : sql`false`} as user_voted
    FROM retro_item r
    JOIN "user" u ON r.author_id = u.id
    WHERE r.endeavor_id = ${id}
    ORDER BY r.category, r.votes DESC, r.created_at DESC
  `);

  // Group by category
  const grouped: Record<string, typeof result.rows> = {};
  for (const row of result.rows) {
    const cat = (row as { category: string }).category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(row);
  }

  return NextResponse.json(grouped);
}

// POST - add a retro item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, content } = await request.json();

  if (!content?.trim() || !["went_well", "improve", "action_item"].includes(category)) {
    return NextResponse.json({ error: "Content and valid category required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS retro_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      votes INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO retro_item (endeavor_id, author_id, category, content)
    VALUES (${id}, ${session.user.id}, ${category}, ${content.trim()})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
