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
    CREATE TABLE IF NOT EXISTS task_dependency (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      task_id UUID NOT NULL,
      depends_on_id UUID NOT NULL,
      type TEXT NOT NULL DEFAULT 'blocks',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(task_id, depends_on_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT td.*,
      t1.title as task_title, t1.status as task_status,
      t2.title as depends_on_title, t2.status as depends_on_status
    FROM task_dependency td
    JOIN task t1 ON td.task_id = t1.id
    JOIN task t2 ON td.depends_on_id = t2.id
    WHERE td.endeavor_id = ${id}
    ORDER BY td.created_at DESC
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

  const { taskId, dependsOnId, type } = await request.json();

  if (!taskId || !dependsOnId) {
    return NextResponse.json({ error: "Both task IDs required" }, { status: 400 });
  }

  if (taskId === dependsOnId) {
    return NextResponse.json({ error: "Task cannot depend on itself" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS task_dependency (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      task_id UUID NOT NULL,
      depends_on_id UUID NOT NULL,
      type TEXT NOT NULL DEFAULT 'blocks',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(task_id, depends_on_id)
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO task_dependency (endeavor_id, task_id, depends_on_id, type)
    VALUES (${id}, ${taskId}, ${dependsOnId}, ${type || "blocks"})
    ON CONFLICT (task_id, depends_on_id) DO NOTHING
    RETURNING *
  `);

  return NextResponse.json(result.rows[0] || { ok: true }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const depId = searchParams.get("id");

  await db.execute(sql`
    DELETE FROM task_dependency WHERE id = ${depId} AND endeavor_id = ${id}
  `);

  return NextResponse.json({ ok: true });
}
