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

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS retrospective (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      went_well TEXT,
      to_improve TEXT,
      action_items TEXT,
      mood TEXT DEFAULT 'neutral',
      sprint_number INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT r.*, u.name as author_name
      FROM retrospective r
      JOIN "user" u ON r.author_id = u.id
      WHERE r.endeavor_id = ${endeavorId}
      ORDER BY r.created_at DESC LIMIT 20
    `);
  } else {
    result = await db.execute(sql`
      SELECT r.*, u.name as author_name, e.title as endeavor_title
      FROM retrospective r
      JOIN "user" u ON r.author_id = u.id
      LEFT JOIN endeavor e ON r.endeavor_id = e.id
      WHERE r.author_id = ${session.user.id}
      ORDER BY r.created_at DESC LIMIT 20
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, wentWell, toImprove, actionItems, mood, sprintNumber, endeavorId } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS retrospective (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      went_well TEXT,
      to_improve TEXT,
      action_items TEXT,
      mood TEXT DEFAULT 'neutral',
      sprint_number INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO retrospective (author_id, endeavor_id, title, went_well, to_improve, action_items, mood, sprint_number)
    VALUES (${session.user.id}, ${endeavorId || null}, ${title.trim()}, ${wentWell || null}, ${toImprove || null}, ${actionItems || null}, ${mood || "neutral"}, ${sprintNumber || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
