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
    CREATE TABLE IF NOT EXISTS sprint (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      number INT NOT NULL,
      title TEXT NOT NULL,
      goal TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'planning',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT s.*,
      (SELECT COUNT(*) FROM task t WHERE t.sprint_id = s.id) as total_tasks,
      (SELECT COUNT(*) FROM task t WHERE t.sprint_id = s.id AND t.status = 'done') as completed_tasks
    FROM sprint s
    WHERE s.endeavor_id = ${endeavorId}
    ORDER BY s.number DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endeavorId, title, goal, startDate, endDate } = await request.json();
  if (!endeavorId || !title?.trim() || !startDate || !endDate) {
    return NextResponse.json({ error: "Endeavor, title, and dates required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sprint (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      number INT NOT NULL,
      title TEXT NOT NULL,
      goal TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'planning',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Auto-increment sprint number
  const countResult = await db.execute(sql`
    SELECT COALESCE(MAX(number), 0) + 1 as next_number FROM sprint WHERE endeavor_id = ${endeavorId}
  `);
  const nextNumber = (countResult.rows[0] as { next_number: number }).next_number;

  const result = await db.execute(sql`
    INSERT INTO sprint (endeavor_id, number, title, goal, start_date, end_date)
    VALUES (${endeavorId}, ${nextNumber}, ${title.trim()}, ${goal || null}, ${startDate}, ${endDate})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "Sprint id and status required" }, { status: 400 });

  const validStatuses = ["planning", "active", "review", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.execute(sql`UPDATE sprint SET status = ${status} WHERE id = ${id}`);

  return NextResponse.json({ success: true });
}
