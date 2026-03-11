import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { event, member, user } from "@/lib/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list events for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
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
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const events = await db
    .select({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      createdById: event.createdById,
      createdByName: user.name,
      createdAt: event.createdAt,
    })
    .from(event)
    .innerJoin(user, eq(event.createdById, user.id))
    .where(eq(event.endeavorId, endeavorId))
    .orderBy(desc(event.startsAt));

  return NextResponse.json(events);
}

// POST — create an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { title, description, location, startsAt, endsAt } = await request.json();

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  if (!startsAt) {
    return NextResponse.json({ error: "Start time required" }, { status: 400 });
  }

  const [created] = await db
    .insert(event)
    .values({
      endeavorId,
      createdById: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
