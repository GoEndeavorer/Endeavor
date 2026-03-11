import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS automation (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      trigger_config JSONB DEFAULT '{}',
      action_type TEXT NOT NULL,
      action_config JSONB DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      run_count INT NOT NULL DEFAULT 0,
      last_run_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT * FROM automation
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, endeavorId, triggerType, triggerConfig, actionType, actionConfig } = await request.json();

  if (!name?.trim() || !triggerType || !actionType) {
    return NextResponse.json({ error: "Name, trigger type, and action type required" }, { status: 400 });
  }

  const validTriggers = ["task_completed", "member_joined", "milestone_reached", "discussion_posted", "deadline_approaching"];
  const validActions = ["send_notification", "post_update", "assign_badge", "create_task", "send_email"];

  if (!validTriggers.includes(triggerType)) {
    return NextResponse.json({ error: "Invalid trigger type" }, { status: 400 });
  }
  if (!validActions.includes(actionType)) {
    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS automation (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      trigger_config JSONB DEFAULT '{}',
      action_type TEXT NOT NULL,
      action_config JSONB DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      run_count INT NOT NULL DEFAULT 0,
      last_run_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO automation (user_id, endeavor_id, name, trigger_type, trigger_config, action_type, action_config)
    VALUES (${session.user.id}, ${endeavorId || null}, ${name.trim()}, ${triggerType}, ${JSON.stringify(triggerConfig || {})}, ${actionType}, ${JSON.stringify(actionConfig || {})})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, enabled } = await request.json();

  await db.execute(sql`
    UPDATE automation SET enabled = ${enabled}
    WHERE id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  await db.execute(sql`
    DELETE FROM automation WHERE id = ${id} AND user_id = ${session.user.id}
  `);

  return NextResponse.json({ ok: true });
}
