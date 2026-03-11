import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS webhook (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      url TEXT NOT NULL,
      secret TEXT,
      events TEXT[] NOT NULL DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      last_triggered TIMESTAMPTZ,
      failure_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT id, user_id, endeavor_id, url, events, enabled, last_triggered, failure_count, created_at
    FROM webhook
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, events, secret, endeavorId } = await request.json();
  if (!url?.trim() || !events?.length) {
    return NextResponse.json({ error: "URL and events required" }, { status: 400 });
  }

  const validEvents = [
    "endeavor.created", "endeavor.updated", "endeavor.completed",
    "member.joined", "member.left",
    "task.created", "task.completed",
    "milestone.reached",
    "story.published",
    "discussion.posted",
  ];
  const filteredEvents = events.filter((e: string) => validEvents.includes(e));
  if (filteredEvents.length === 0) {
    return NextResponse.json({ error: "No valid events" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS webhook (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      url TEXT NOT NULL,
      secret TEXT,
      events TEXT[] NOT NULL DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      last_triggered TIMESTAMPTZ,
      failure_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO webhook (user_id, endeavor_id, url, secret, events)
    VALUES (${session.user.id}, ${endeavorId || null}, ${url.trim()}, ${secret || null}, ${filteredEvents})
    RETURNING id, user_id, endeavor_id, url, events, enabled, created_at
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Webhook id required" }, { status: 400 });

  await db.execute(sql`DELETE FROM webhook WHERE id = ${id} AND user_id = ${session.user.id}`);
  return NextResponse.json({ success: true });
}
