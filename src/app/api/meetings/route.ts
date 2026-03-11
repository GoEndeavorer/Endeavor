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
  const upcoming = searchParams.get("upcoming") !== "false";

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS meeting (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organizer_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT NOT NULL,
      description TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      location TEXT,
      meeting_url TEXT,
      recurring TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS meeting_attendee (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      UNIQUE(meeting_id, user_id)
    )
  `);

  const timeFilter = upcoming ? sql`AND m.start_time >= NOW()` : sql`AND m.start_time < NOW()`;

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT m.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM meeting_attendee ma WHERE ma.meeting_id = m.id AND ma.status = 'accepted') as attendee_count
      FROM meeting m
      JOIN "user" u ON m.organizer_id = u.id
      WHERE m.endeavor_id = ${endeavorId} ${timeFilter}
      ORDER BY m.start_time ASC
    `);
  } else {
    result = await db.execute(sql`
      SELECT m.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM meeting_attendee ma WHERE ma.meeting_id = m.id AND ma.status = 'accepted') as attendee_count
      FROM meeting m
      JOIN "user" u ON m.organizer_id = u.id
      WHERE (m.organizer_id = ${session.user.id} OR m.id IN (
        SELECT meeting_id FROM meeting_attendee WHERE user_id = ${session.user.id}
      )) ${timeFilter}
      ORDER BY m.start_time ASC
      LIMIT 50
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, startTime, endTime, location, meetingUrl, endeavorId, recurring } = await request.json();
  if (!title?.trim() || !startTime) {
    return NextResponse.json({ error: "Title and start time required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS meeting (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organizer_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT NOT NULL,
      description TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      location TEXT,
      meeting_url TEXT,
      recurring TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO meeting (organizer_id, endeavor_id, title, description, start_time, end_time, location, meeting_url, recurring)
    VALUES (${session.user.id}, ${endeavorId || null}, ${title.trim()}, ${description || null}, ${startTime}, ${endTime || null}, ${location || null}, ${meetingUrl || null}, ${recurring || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
