import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list recent standups for an endeavor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS standup (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      yesterday TEXT,
      today TEXT,
      blockers TEXT,
      mood TEXT,
      standup_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id, standup_date)
    )
  `);

  const targetDate = date || new Date().toISOString().split("T")[0];

  const result = await db.execute(sql`
    SELECT
      s.*,
      u.name,
      u.image
    FROM standup s
    JOIN "user" u ON s.user_id = u.id
    WHERE s.endeavor_id = ${id}
      AND s.standup_date = ${targetDate}
    ORDER BY s.created_at ASC
  `);

  // Also get recent dates that have standups
  const dates = await db.execute(sql`
    SELECT DISTINCT standup_date
    FROM standup
    WHERE endeavor_id = ${id}
    ORDER BY standup_date DESC
    LIMIT 14
  `);

  return NextResponse.json({
    standups: result.rows,
    availableDates: dates.rows.map((r) => (r as { standup_date: string }).standup_date),
  });
}

// POST - submit a standup
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { yesterday, today, blockers, mood } = await request.json();

  if (!today?.trim()) {
    return NextResponse.json({ error: "Today's plan is required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS standup (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      yesterday TEXT,
      today TEXT,
      blockers TEXT,
      mood TEXT,
      standup_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id, standup_date)
    )
  `);

  // Upsert - one standup per user per day
  const result = await db.execute(sql`
    INSERT INTO standup (endeavor_id, user_id, yesterday, today, blockers, mood)
    VALUES (${id}, ${session.user.id}, ${yesterday || null}, ${today.trim()}, ${blockers || null}, ${mood || null})
    ON CONFLICT (endeavor_id, user_id, standup_date)
    DO UPDATE SET yesterday = ${yesterday || null}, today = ${today.trim()}, blockers = ${blockers || null}, mood = ${mood || null}
    RETURNING *
  `);

  return NextResponse.json(result.rows[0]);
}
