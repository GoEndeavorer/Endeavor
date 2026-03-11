import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const NOTIFICATION_TYPES = [
  "join_request",
  "member_joined",
  "new_discussion",
  "task_assigned",
  "funding_received",
  "milestone_completed",
  "status_change",
  "update_posted",
] as const;

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notification_preference (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id),
      email_digest BOOLEAN NOT NULL DEFAULT true,
      email_milestones BOOLEAN NOT NULL DEFAULT true,
      email_discussions BOOLEAN NOT NULL DEFAULT false,
      email_join_requests BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
}

async function ensureTypePreferenceTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notification_type_preference (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      enabled BOOLEAN DEFAULT true,
      UNIQUE(user_id, type)
    )
  `);
}

// GET /api/notification-preferences — return current user's preferences
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTable();
  await ensureTypePreferenceTable();

  const result = await db.execute(sql`
    SELECT email_digest, email_milestones, email_discussions, email_join_requests, updated_at
    FROM notification_preference
    WHERE user_id = ${session.user.id}
  `);

  // Fetch per-type preferences
  const typeResult = await db.execute(sql`
    SELECT type, enabled
    FROM notification_type_preference
    WHERE user_id = ${session.user.id}
  `);

  // Build type preferences map (default all to true)
  const typePreferences: Record<string, boolean> = {};
  for (const t of NOTIFICATION_TYPES) {
    typePreferences[t] = true;
  }
  for (const row of typeResult.rows) {
    typePreferences[row.type as string] = row.enabled as boolean;
  }

  if (result.rows.length === 0) {
    return NextResponse.json({
      emailDigest: true,
      emailMilestones: true,
      emailDiscussions: false,
      emailJoinRequests: true,
      typePreferences,
    });
  }

  const row = result.rows[0];
  return NextResponse.json({
    emailDigest: row.email_digest,
    emailMilestones: row.email_milestones,
    emailDiscussions: row.email_discussions,
    emailJoinRequests: row.email_join_requests,
    updatedAt: row.updated_at,
    typePreferences,
  });
}

// PATCH /api/notification-preferences — upsert preferences
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { emailDigest, emailMilestones, emailDiscussions, emailJoinRequests } = body;

  // Validate that at least one field is provided
  if (
    typeof emailDigest !== "boolean" &&
    typeof emailMilestones !== "boolean" &&
    typeof emailDiscussions !== "boolean" &&
    typeof emailJoinRequests !== "boolean"
  ) {
    return NextResponse.json({ error: "At least one preference field is required" }, { status: 400 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO notification_preference (user_id, email_digest, email_milestones, email_discussions, email_join_requests, updated_at)
    VALUES (
      ${session.user.id},
      ${typeof emailDigest === "boolean" ? emailDigest : true},
      ${typeof emailMilestones === "boolean" ? emailMilestones : true},
      ${typeof emailDiscussions === "boolean" ? emailDiscussions : false},
      ${typeof emailJoinRequests === "boolean" ? emailJoinRequests : true},
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email_digest = COALESCE(${typeof emailDigest === "boolean" ? emailDigest : null}, notification_preference.email_digest),
      email_milestones = COALESCE(${typeof emailMilestones === "boolean" ? emailMilestones : null}, notification_preference.email_milestones),
      email_discussions = COALESCE(${typeof emailDiscussions === "boolean" ? emailDiscussions : null}, notification_preference.email_discussions),
      email_join_requests = COALESCE(${typeof emailJoinRequests === "boolean" ? emailJoinRequests : null}, notification_preference.email_join_requests),
      updated_at = NOW()
    RETURNING email_digest, email_milestones, email_discussions, email_join_requests, updated_at
  `);

  const row = result.rows[0];
  return NextResponse.json({
    emailDigest: row.email_digest,
    emailMilestones: row.email_milestones,
    emailDiscussions: row.email_discussions,
    emailJoinRequests: row.email_join_requests,
    updatedAt: row.updated_at,
  });
}

// POST /api/notification-preferences — update a per-type notification preference
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, enabled } = body;

  if (!type || typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "type (string) and enabled (boolean) are required" },
      { status: 400 }
    );
  }

  if (!NOTIFICATION_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid notification type: ${type}` },
      { status: 400 }
    );
  }

  await ensureTypePreferenceTable();

  await db.execute(sql`
    INSERT INTO notification_type_preference (user_id, type, enabled)
    VALUES (${session.user.id}, ${type}, ${enabled})
    ON CONFLICT (user_id, type) DO UPDATE SET
      enabled = ${enabled}
  `);

  return NextResponse.json({ type, enabled });
}
