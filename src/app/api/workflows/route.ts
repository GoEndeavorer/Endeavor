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
    CREATE TABLE IF NOT EXISTS workflow (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      endeavor_id UUID,
      name TEXT NOT NULL,
      description TEXT,
      steps JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      run_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT w.*, u.name as creator_name
      FROM workflow w
      JOIN "user" u ON w.creator_id = u.id
      WHERE w.endeavor_id = ${endeavorId}
      ORDER BY w.created_at DESC
    `);
  } else {
    result = await db.execute(sql`
      SELECT w.*, u.name as creator_name
      FROM workflow w
      JOIN "user" u ON w.creator_id = u.id
      WHERE w.creator_id = ${session.user.id}
      ORDER BY w.created_at DESC
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, steps, endeavorId } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS workflow (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      endeavor_id UUID,
      name TEXT NOT NULL,
      description TEXT,
      steps JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      run_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO workflow (creator_id, endeavor_id, name, description, steps)
    VALUES (${session.user.id}, ${endeavorId || null}, ${name.trim()}, ${description || null}, ${JSON.stringify(steps || [])})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
