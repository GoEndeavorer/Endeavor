import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { member } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS member_availability (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      day_of_week INT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id, day_of_week)
    )
  `);
}

// GET — list member availability for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, id),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    SELECT
      a.*,
      u.name as user_name
    FROM member_availability a
    JOIN "user" u ON a.user_id = u.id
    WHERE a.endeavor_id = ${id}
    ORDER BY a.day_of_week ASC, a.start_time ASC
  `);

  return NextResponse.json(result.rows);
}

// POST — set your availability (upserts by day_of_week)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, id),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { day_of_week, start_time, end_time, timezone } = await request.json();

  // Validate day_of_week (0=Sunday, 1=Monday, ..., 6=Saturday)
  if (typeof day_of_week !== "number" || day_of_week < 0 || day_of_week > 6) {
    return NextResponse.json(
      { error: "day_of_week must be 0-6" },
      { status: 400 }
    );
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!start_time || !timeRegex.test(start_time)) {
    return NextResponse.json(
      { error: "start_time must be HH:MM format" },
      { status: 400 }
    );
  }
  if (!end_time || !timeRegex.test(end_time)) {
    return NextResponse.json(
      { error: "end_time must be HH:MM format" },
      { status: 400 }
    );
  }

  if (start_time >= end_time) {
    return NextResponse.json(
      { error: "end_time must be after start_time" },
      { status: 400 }
    );
  }

  const tz = timezone || "UTC";

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO member_availability (endeavor_id, user_id, day_of_week, start_time, end_time, timezone)
    VALUES (${id}, ${session.user.id}, ${day_of_week}, ${start_time}, ${end_time}, ${tz})
    ON CONFLICT (endeavor_id, user_id, day_of_week)
    DO UPDATE SET start_time = ${start_time}, end_time = ${end_time}, timezone = ${tz}
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
