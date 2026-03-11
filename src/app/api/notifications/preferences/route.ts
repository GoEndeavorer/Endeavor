import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const EVENT_TYPES = [
  "endeavor_update",
  "new_member",
  "task_assigned",
  "task_completed",
  "discussion_reply",
  "endorsement_received",
  "milestone_completed",
  "story_published",
  "funding_received",
  "weekly_digest",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notification_preference (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT true,
      channel TEXT NOT NULL DEFAULT 'in_app',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, event_type)
    )
  `);
}

function buildDefaults(userId: string) {
  return EVENT_TYPES.map((eventType) => ({
    userId,
    eventType,
    enabled: true,
    channel: "in_app",
  }));
}

// GET - returns all notification preferences for the current user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    SELECT id, user_id, event_type, enabled, channel, created_at, updated_at
    FROM notification_preference
    WHERE user_id = ${session.user.id}
    ORDER BY event_type ASC
  `);

  const rows = result.rows as Array<{
    id: string;
    user_id: string;
    event_type: string;
    enabled: boolean;
    channel: string;
    created_at: string;
    updated_at: string;
  }>;

  // If no preferences exist yet, return defaults (all enabled)
  if (rows.length === 0) {
    return NextResponse.json(buildDefaults(session.user.id));
  }

  // Build a map of saved preferences
  const savedMap = new Map(rows.map((r) => [r.event_type, r]));

  // Merge with defaults so new event types always appear
  const preferences = EVENT_TYPES.map((eventType) => {
    const saved = savedMap.get(eventType);
    if (saved) {
      return {
        id: saved.id,
        userId: saved.user_id,
        eventType: saved.event_type,
        enabled: saved.enabled,
        channel: saved.channel,
        createdAt: saved.created_at,
        updatedAt: saved.updated_at,
      };
    }
    return {
      userId: session.user.id,
      eventType,
      enabled: true,
      channel: "in_app",
    };
  });

  return NextResponse.json(preferences);
}

// PUT - upsert a single notification preference
export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { eventType, enabled } = body as {
    eventType: string;
    enabled: boolean;
  };

  // Validate eventType
  if (!eventType || !EVENT_TYPES.includes(eventType as EventType)) {
    return NextResponse.json(
      {
        error: "Invalid event type",
        validTypes: EVENT_TYPES,
      },
      { status: 400 }
    );
  }

  if (typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled must be a boolean" },
      { status: 400 }
    );
  }

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO notification_preference (user_id, event_type, enabled)
    VALUES (${session.user.id}, ${eventType}, ${enabled})
    ON CONFLICT (user_id, event_type)
    DO UPDATE SET enabled = ${enabled}, updated_at = NOW()
    RETURNING id, user_id, event_type, enabled, channel, created_at, updated_at
  `);

  const row = result.rows[0] as {
    id: string;
    user_id: string;
    event_type: string;
    enabled: boolean;
    channel: string;
    created_at: string;
    updated_at: string;
  };

  return NextResponse.json({
    id: row.id,
    userId: row.user_id,
    eventType: row.event_type,
    enabled: row.enabled,
    channel: row.channel,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
