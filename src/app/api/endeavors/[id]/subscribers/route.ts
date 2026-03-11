import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_subscriber (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      notify_updates BOOLEAN NOT NULL DEFAULT true,
      notify_milestones BOOLEAN NOT NULL DEFAULT true,
      notify_stories BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT es.*, u.name, u.image
    FROM endeavor_subscriber es
    JOIN "user" u ON es.user_id = u.id
    WHERE es.endeavor_id = ${id}
    ORDER BY es.created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { notifyUpdates = true, notifyMilestones = true, notifyStories = true } = body;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_subscriber (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      notify_updates BOOLEAN NOT NULL DEFAULT true,
      notify_milestones BOOLEAN NOT NULL DEFAULT true,
      notify_stories BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id)
    )
  `);

  await db.execute(sql`
    INSERT INTO endeavor_subscriber (endeavor_id, user_id, notify_updates, notify_milestones, notify_stories)
    VALUES (${id}, ${session.user.id}, ${notifyUpdates}, ${notifyMilestones}, ${notifyStories})
    ON CONFLICT (endeavor_id, user_id) DO UPDATE SET
      notify_updates = EXCLUDED.notify_updates,
      notify_milestones = EXCLUDED.notify_milestones,
      notify_stories = EXCLUDED.notify_stories
  `);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    DELETE FROM endeavor_subscriber WHERE endeavor_id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}
