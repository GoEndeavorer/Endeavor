import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Ensure the user_goal table exists
async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_goal (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id),
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      completed_at TIMESTAMP,
      target_date TIMESTAMP,
      endeavor_id UUID REFERENCES endeavor(id),
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
}

// GET /api/goals — list user's active goals
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    SELECT id, title, completed, completed_at, target_date, endeavor_id, created_at
    FROM user_goal
    WHERE user_id = ${session.user.id}
    ORDER BY completed ASC, created_at DESC
    LIMIT 20
  `);

  return NextResponse.json(result.rows);
}

// POST /api/goals — create a new goal
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, targetDate, endeavorId } = await request.json();
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  await ensureTable();

  const result = await db.execute(sql`
    INSERT INTO user_goal (user_id, title, target_date, endeavor_id)
    VALUES (
      ${session.user.id},
      ${title.trim()},
      ${targetDate ? new Date(targetDate) : null},
      ${endeavorId || null}
    )
    RETURNING id, title, completed, completed_at, target_date, endeavor_id, created_at
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

// PATCH /api/goals — update a goal
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { goalId, completed, title } = await request.json();
  if (!goalId) {
    return NextResponse.json({ error: "goalId is required" }, { status: 400 });
  }

  await ensureTable();

  // Verify ownership
  const existing = await db.execute(sql`
    SELECT id FROM user_goal WHERE id = ${goalId} AND user_id = ${session.user.id}
  `);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  // Build update based on provided fields
  if (typeof completed === "boolean" && typeof title === "string" && title.trim().length > 0) {
    const result = await db.execute(sql`
      UPDATE user_goal
      SET completed = ${completed},
          completed_at = ${completed ? sql`NOW()` : null},
          title = ${title.trim()}
      WHERE id = ${goalId} AND user_id = ${session.user.id}
      RETURNING id, title, completed, completed_at, target_date, endeavor_id, created_at
    `);
    return NextResponse.json(result.rows[0]);
  }

  if (typeof completed === "boolean") {
    const result = await db.execute(sql`
      UPDATE user_goal
      SET completed = ${completed},
          completed_at = ${completed ? sql`NOW()` : null}
      WHERE id = ${goalId} AND user_id = ${session.user.id}
      RETURNING id, title, completed, completed_at, target_date, endeavor_id, created_at
    `);
    return NextResponse.json(result.rows[0]);
  }

  if (typeof title === "string" && title.trim().length > 0) {
    const result = await db.execute(sql`
      UPDATE user_goal
      SET title = ${title.trim()}
      WHERE id = ${goalId} AND user_id = ${session.user.id}
      RETURNING id, title, completed, completed_at, target_date, endeavor_id, created_at
    `);
    return NextResponse.json(result.rows[0]);
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}
