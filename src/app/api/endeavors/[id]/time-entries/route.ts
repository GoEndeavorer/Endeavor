import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list time entries for an endeavor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || session.user.id;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS time_entry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      task_id UUID,
      description TEXT,
      duration_minutes INT NOT NULL,
      entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      te.*,
      u.name as user_name,
      t.title as task_title
    FROM time_entry te
    JOIN "user" u ON te.user_id = u.id
    LEFT JOIN task t ON te.task_id = t.id
    WHERE te.endeavor_id = ${id}
      ${userId ? sql`AND te.user_id = ${userId}` : sql``}
    ORDER BY te.entry_date DESC, te.created_at DESC
    LIMIT 100
  `);

  // Summary stats
  const summary = await db.execute(sql`
    SELECT
      SUM(duration_minutes) as total_minutes,
      COUNT(DISTINCT entry_date) as days_tracked,
      COUNT(DISTINCT user_id) as contributors
    FROM time_entry
    WHERE endeavor_id = ${id}
  `);

  return NextResponse.json({
    entries: result.rows,
    summary: summary.rows[0] || { total_minutes: 0, days_tracked: 0, contributors: 0 },
  });
}

// POST - log time
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, description, durationMinutes, entryDate } = await request.json();

  if (!durationMinutes || durationMinutes < 1) {
    return NextResponse.json({ error: "Duration must be at least 1 minute" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS time_entry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      task_id UUID,
      description TEXT,
      duration_minutes INT NOT NULL,
      entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO time_entry (endeavor_id, user_id, task_id, description, duration_minutes, entry_date)
    VALUES (${id}, ${session.user.id}, ${taskId || null}, ${description || null}, ${durationMinutes}, ${entryDate || new Date().toISOString().split("T")[0]})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

// DELETE - remove a time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await request.json();

  await db.execute(sql`
    DELETE FROM time_entry WHERE id = ${entryId} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ success: true });
}
