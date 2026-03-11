import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kanban_card (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      column_name TEXT NOT NULL DEFAULT 'backlog',
      priority TEXT NOT NULL DEFAULT 'medium',
      assignee_id TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT kc.*, u.name as creator_name, a.name as assignee_name
      FROM kanban_card kc
      JOIN "user" u ON kc.user_id = u.id
      LEFT JOIN "user" a ON kc.assignee_id = a.id
      WHERE kc.endeavor_id = ${endeavorId}
      ORDER BY kc.display_order ASC, kc.created_at DESC
    `);
  } else {
    result = await db.execute(sql`
      SELECT kc.*, u.name as creator_name, a.name as assignee_name
      FROM kanban_card kc
      JOIN "user" u ON kc.user_id = u.id
      LEFT JOIN "user" a ON kc.assignee_id = a.id
      WHERE kc.user_id = ${session.user.id}
      ORDER BY kc.display_order ASC, kc.created_at DESC
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, column, priority, endeavorId, assigneeId } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kanban_card (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      column_name TEXT NOT NULL DEFAULT 'backlog',
      priority TEXT NOT NULL DEFAULT 'medium',
      assignee_id TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO kanban_card (user_id, endeavor_id, title, description, column_name, priority, assignee_id)
    VALUES (${session.user.id}, ${endeavorId || null}, ${title.trim()}, ${description || null}, ${column || "backlog"}, ${priority || "medium"}, ${assigneeId || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, column, displayOrder } = await request.json();
  if (!id) return NextResponse.json({ error: "Card id required" }, { status: 400 });

  if (column !== undefined) {
    await db.execute(sql`
      UPDATE kanban_card SET column_name = ${column} WHERE id = ${id}
    `);
  }
  if (displayOrder !== undefined) {
    await db.execute(sql`
      UPDATE kanban_card SET display_order = ${displayOrder} WHERE id = ${id}
    `);
  }

  return NextResponse.json({ success: true });
}
