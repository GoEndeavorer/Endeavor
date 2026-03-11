import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// POST - RSVP to an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json(); // going, maybe, not_going

  if (!["going", "maybe", "not_going"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Check capacity
  if (status === "going") {
    const event = await db.execute(sql`
      SELECT max_attendees FROM event WHERE id = ${eventId}
    `);
    if (event.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const maxAttendees = (event.rows[0] as { max_attendees: number | null }).max_attendees;
    if (maxAttendees) {
      const currentCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM event_rsvp
        WHERE event_id = ${eventId} AND status = 'going' AND user_id != ${session.user.id}
      `);
      if (Number((currentCount.rows[0] as { count: number }).count) >= maxAttendees) {
        return NextResponse.json({ error: "Event is full" }, { status: 400 });
      }
    }
  }

  if (status === "not_going") {
    await db.execute(sql`
      DELETE FROM event_rsvp WHERE event_id = ${eventId} AND user_id = ${session.user.id}
    `);
    return NextResponse.json({ status: "removed" });
  }

  await db.execute(sql`
    INSERT INTO event_rsvp (event_id, user_id, status)
    VALUES (${eventId}, ${session.user.id}, ${status})
    ON CONFLICT (event_id, user_id) DO UPDATE SET status = ${status}
  `);

  return NextResponse.json({ status });
}

// GET - list RSVPs for an event
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const result = await db.execute(sql`
    SELECT
      r.status,
      r.created_at,
      u.id as user_id,
      u.name,
      u.image
    FROM event_rsvp r
    JOIN "user" u ON r.user_id = u.id
    WHERE r.event_id = ${eventId}
    ORDER BY r.created_at ASC
  `);

  return NextResponse.json(result.rows);
}
