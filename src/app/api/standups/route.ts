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
    CREATE TABLE IF NOT EXISTS standup (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      yesterday TEXT,
      today TEXT,
      blockers TEXT,
      mood TEXT DEFAULT 'neutral',
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT s.*, u.name as user_name, u.image as user_image
      FROM standup s
      JOIN "user" u ON s.user_id = u.id
      WHERE s.endeavor_id = ${endeavorId}
      ORDER BY s.date DESC, s.created_at DESC
      LIMIT 50
    `);
  } else {
    result = await db.execute(sql`
      SELECT s.*, u.name as user_name, u.image as user_image
      FROM standup s
      JOIN "user" u ON s.user_id = u.id
      WHERE s.user_id = ${session.user.id}
      ORDER BY s.date DESC
      LIMIT 30
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { yesterday, today, blockers, mood, endeavorId } = await request.json();

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS standup (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      yesterday TEXT,
      today TEXT,
      blockers TEXT,
      mood TEXT DEFAULT 'neutral',
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO standup (user_id, endeavor_id, yesterday, today, blockers, mood)
    VALUES (${session.user.id}, ${endeavorId || null}, ${yesterday || null}, ${today || null}, ${blockers || null}, ${mood || "neutral"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
