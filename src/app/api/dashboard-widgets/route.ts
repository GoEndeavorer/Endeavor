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
    CREATE TABLE IF NOT EXISTS dashboard_widget (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      widget_type TEXT NOT NULL,
      title TEXT NOT NULL,
      config JSONB NOT NULL DEFAULT '{}',
      position INT NOT NULL DEFAULT 0,
      size TEXT NOT NULL DEFAULT 'medium',
      enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT * FROM dashboard_widget
    WHERE user_id = ${session.user.id} AND enabled = true
    ORDER BY position ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { widgetType, title, config, size } = await request.json();
  if (!widgetType || !title) return NextResponse.json({ error: "Widget type and title required" }, { status: 400 });

  const validTypes = ["stats", "recent-activity", "tasks", "calendar", "chart", "notes", "bookmarks", "goals", "time-log"];
  if (!validTypes.includes(widgetType)) {
    return NextResponse.json({ error: "Invalid widget type" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS dashboard_widget (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      widget_type TEXT NOT NULL,
      title TEXT NOT NULL,
      config JSONB NOT NULL DEFAULT '{}',
      position INT NOT NULL DEFAULT 0,
      size TEXT NOT NULL DEFAULT 'medium',
      enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Get next position
  const posResult = await db.execute(sql`
    SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM dashboard_widget WHERE user_id = ${session.user.id}
  `);
  const nextPos = (posResult.rows[0] as { next_pos: number }).next_pos;

  const result = await db.execute(sql`
    INSERT INTO dashboard_widget (user_id, widget_type, title, config, position, size)
    VALUES (${session.user.id}, ${widgetType}, ${title}, ${JSON.stringify(config || {})}, ${nextPos}, ${size || "medium"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, position, enabled, config } = await request.json();
  if (!id) return NextResponse.json({ error: "Widget id required" }, { status: 400 });

  if (position !== undefined) {
    await db.execute(sql`UPDATE dashboard_widget SET position = ${position} WHERE id = ${id} AND user_id = ${session.user.id}`);
  }
  if (enabled !== undefined) {
    await db.execute(sql`UPDATE dashboard_widget SET enabled = ${enabled} WHERE id = ${id} AND user_id = ${session.user.id}`);
  }
  if (config !== undefined) {
    await db.execute(sql`UPDATE dashboard_widget SET config = ${JSON.stringify(config)} WHERE id = ${id} AND user_id = ${session.user.id}`);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Widget id required" }, { status: 400 });

  await db.execute(sql`DELETE FROM dashboard_widget WHERE id = ${id} AND user_id = ${session.user.id}`);
  return NextResponse.json({ success: true });
}
