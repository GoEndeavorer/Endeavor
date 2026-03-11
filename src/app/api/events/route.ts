import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list events (optionally filtered by endeavor)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");
  const upcoming = searchParams.get("upcoming") === "true";

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS event (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      location TEXT,
      location_type TEXT NOT NULL DEFAULT 'remote',
      meeting_url TEXT,
      max_attendees INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS event_rsvp (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'going',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(event_id, user_id)
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT
        e.*,
        u.name as creator_name,
        u.image as creator_image,
        (SELECT COUNT(*) FROM event_rsvp WHERE event_id = e.id AND status = 'going') as attendee_count,
        en.title as endeavor_title
      FROM event e
      JOIN "user" u ON e.creator_id = u.id
      LEFT JOIN endeavor en ON e.endeavor_id = en.id
      WHERE e.endeavor_id = ${endeavorId}
      ${upcoming ? sql`AND e.start_time >= NOW()` : sql``}
      ORDER BY e.start_time ASC
    `);
  } else {
    // Get events from user's endeavors
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    result = await db.execute(sql`
      SELECT
        e.*,
        u.name as creator_name,
        u.image as creator_image,
        (SELECT COUNT(*) FROM event_rsvp WHERE event_id = e.id AND status = 'going') as attendee_count,
        en.title as endeavor_title
      FROM event e
      JOIN "user" u ON e.creator_id = u.id
      LEFT JOIN endeavor en ON e.endeavor_id = en.id
      WHERE e.endeavor_id IN (
        SELECT endeavor_id FROM member WHERE user_id = ${session.user.id} AND status = 'approved'
        UNION
        SELECT id FROM endeavor WHERE creator_id = ${session.user.id}
      )
      ${upcoming ? sql`AND e.start_time >= NOW()` : sql``}
      ORDER BY e.start_time ASC
      LIMIT 50
    `);
  }

  return NextResponse.json(result.rows);
}

// POST - create an event
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endeavorId, title, description, startTime, endTime, location, locationType, meetingUrl, maxAttendees } =
    await request.json();

  if (!title?.trim() || !startTime) {
    return NextResponse.json({ error: "Title and start time required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS event (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      location TEXT,
      location_type TEXT NOT NULL DEFAULT 'remote',
      meeting_url TEXT,
      max_attendees INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO event (endeavor_id, creator_id, title, description, start_time, end_time, location, location_type, meeting_url, max_attendees)
    VALUES (
      ${endeavorId || null},
      ${session.user.id},
      ${title.trim()},
      ${description || null},
      ${new Date(startTime).toISOString()},
      ${endTime ? new Date(endTime).toISOString() : null},
      ${location || null},
      ${locationType || "remote"},
      ${meetingUrl || null},
      ${maxAttendees || null}
    )
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
