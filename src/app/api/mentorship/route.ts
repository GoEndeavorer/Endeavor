import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list mentorship connections for current user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mentorship (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mentor_id TEXT NOT NULL,
      mentee_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      topic TEXT,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      m.id,
      m.mentor_id,
      m.mentee_id,
      m.status,
      m.topic,
      m.message,
      m.created_at,
      mentor.name as mentor_name,
      mentor.image as mentor_image,
      mentor.skills as mentor_skills,
      mentee.name as mentee_name,
      mentee.image as mentee_image
    FROM mentorship m
    JOIN "user" mentor ON m.mentor_id = mentor.id
    JOIN "user" mentee ON m.mentee_id = mentee.id
    WHERE m.mentor_id = ${session.user.id} OR m.mentee_id = ${session.user.id}
    ORDER BY m.created_at DESC
  `);

  return NextResponse.json(result.rows);
}

// POST - request mentorship
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mentorId, topic, message } = await request.json();

  if (!mentorId) {
    return NextResponse.json({ error: "Mentor ID required" }, { status: 400 });
  }

  if (mentorId === session.user.id) {
    return NextResponse.json({ error: "Cannot mentor yourself" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mentorship (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mentor_id TEXT NOT NULL,
      mentee_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      topic TEXT,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Check for existing mentorship
  const existing = await db.execute(sql`
    SELECT id FROM mentorship
    WHERE mentor_id = ${mentorId} AND mentee_id = ${session.user.id}
    AND status IN ('pending', 'active')
  `);

  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Mentorship request already exists" }, { status: 409 });
  }

  await db.execute(sql`
    INSERT INTO mentorship (mentor_id, mentee_id, topic, message)
    VALUES (${mentorId}, ${session.user.id}, ${topic || null}, ${message || null})
  `);

  return NextResponse.json({ success: true });
}

// PATCH - accept/decline mentorship
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mentorshipId, action } = await request.json();

  if (!mentorshipId || !["accept", "decline", "complete"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const mentorship = await db.execute(sql`
    SELECT * FROM mentorship WHERE id = ${mentorshipId}
  `);

  if (mentorship.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const m = mentorship.rows[0] as { mentor_id: string; mentee_id: string; status: string };

  // Only mentor can accept/decline, either party can complete
  if (action === "accept" || action === "decline") {
    if (m.mentor_id !== session.user.id) {
      return NextResponse.json({ error: "Only the mentor can accept or decline" }, { status: 403 });
    }
  }

  if (action === "complete") {
    if (m.mentor_id !== session.user.id && m.mentee_id !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  const statusMap: Record<string, string> = {
    accept: "active",
    decline: "declined",
    complete: "completed",
  };

  await db.execute(sql`
    UPDATE mentorship
    SET status = ${statusMap[action]}, updated_at = NOW()
    WHERE id = ${mentorshipId}
  `);

  return NextResponse.json({ success: true, status: statusMap[action] });
}
