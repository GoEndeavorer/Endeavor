import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list decisions for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS decision_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      context TEXT,
      decision TEXT NOT NULL,
      rationale TEXT,
      status TEXT NOT NULL DEFAULT 'decided',
      decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      d.*,
      u.name as author_name
    FROM decision_log d
    JOIN "user" u ON d.author_id = u.id
    WHERE d.endeavor_id = ${id}
    ORDER BY d.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

// POST - record a decision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, context, decision, rationale, status } = await request.json();

  if (!title?.trim() || !decision?.trim()) {
    return NextResponse.json({ error: "Title and decision required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS decision_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      context TEXT,
      decision TEXT NOT NULL,
      rationale TEXT,
      status TEXT NOT NULL DEFAULT 'decided',
      decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO decision_log (endeavor_id, author_id, title, context, decision, rationale, status)
    VALUES (${id}, ${session.user.id}, ${title.trim()}, ${context || null}, ${decision.trim()}, ${rationale || null}, ${status || "decided"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
