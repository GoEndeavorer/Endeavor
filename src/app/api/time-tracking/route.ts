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
  const period = searchParams.get("period") || "week";

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS time_entry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      task_id UUID,
      description TEXT,
      duration_minutes INT NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const days = period === "month" ? 30 : period === "year" ? 365 : 7;

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT te.*, u.name as user_name, e.title as endeavor_title
      FROM time_entry te
      JOIN "user" u ON te.user_id = u.id
      LEFT JOIN endeavor e ON te.endeavor_id = e.id
      WHERE te.endeavor_id = ${endeavorId} AND te.date >= CURRENT_DATE - ${days}
      ORDER BY te.date DESC, te.created_at DESC
    `);
  } else {
    result = await db.execute(sql`
      SELECT te.*, u.name as user_name, e.title as endeavor_title
      FROM time_entry te
      JOIN "user" u ON te.user_id = u.id
      LEFT JOIN endeavor e ON te.endeavor_id = e.id
      WHERE te.user_id = ${session.user.id} AND te.date >= CURRENT_DATE - ${days}
      ORDER BY te.date DESC, te.created_at DESC
    `);
  }

  // Summary stats
  const summaryResult = await db.execute(sql`
    SELECT
      COALESCE(SUM(duration_minutes), 0) as total_minutes,
      COUNT(*) as entry_count,
      COUNT(DISTINCT date) as active_days
    FROM time_entry
    WHERE user_id = ${session.user.id} AND date >= CURRENT_DATE - ${days}
  `);

  return NextResponse.json({
    entries: result.rows,
    summary: summaryResult.rows[0],
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description, durationMinutes, endeavorId, taskId, date } = await request.json();
  if (!durationMinutes || durationMinutes < 1) {
    return NextResponse.json({ error: "Duration required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS time_entry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      task_id UUID,
      description TEXT,
      duration_minutes INT NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO time_entry (user_id, endeavor_id, task_id, description, duration_minutes, date)
    VALUES (${session.user.id}, ${endeavorId || null}, ${taskId || null}, ${description || null}, ${durationMinutes}, ${date || sql`CURRENT_DATE`})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
