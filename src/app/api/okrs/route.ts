import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function ensureTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS okr_objective (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      period TEXT DEFAULT 'Q1 2026',
      status TEXT DEFAULT 'active',
      progress INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS okr_key_result (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      objective_id UUID NOT NULL REFERENCES okr_objective(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      target_value DECIMAL NOT NULL,
      current_value DECIMAL DEFAULT 0,
      unit TEXT DEFAULT '%',
      status TEXT DEFAULT 'not-started',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();

  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");

  let result;
  if (endeavorId) {
    result = await db.execute(sql`
      SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', kr.id,
              'title', kr.title,
              'target_value', kr.target_value,
              'current_value', kr.current_value,
              'unit', kr.unit,
              'status', kr.status,
              'created_at', kr.created_at
            )
          ) FILTER (WHERE kr.id IS NOT NULL),
          '[]'
        ) as key_results
      FROM okr_objective o
      LEFT JOIN okr_key_result kr ON kr.objective_id = o.id
      WHERE o.endeavor_id = ${endeavorId}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
  } else {
    result = await db.execute(sql`
      SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', kr.id,
              'title', kr.title,
              'target_value', kr.target_value,
              'current_value', kr.current_value,
              'unit', kr.unit,
              'status', kr.status,
              'created_at', kr.created_at
            )
          ) FILTER (WHERE kr.id IS NOT NULL),
          '[]'
        ) as key_results
      FROM okr_objective o
      LEFT JOIN okr_key_result kr ON kr.objective_id = o.id
      WHERE o.creator_id = ${session.user.id}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, endeavorId, period, keyResults } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  await ensureTables();

  const objResult = await db.execute(sql`
    INSERT INTO okr_objective (creator_id, endeavor_id, title, description, period)
    VALUES (${session.user.id}, ${endeavorId || null}, ${title.trim()}, ${description?.trim() || null}, ${period || "Q1 2026"})
    RETURNING *
  `);
  const objective = objResult.rows[0] as { id: string };

  const insertedKeyResults = [];
  if (Array.isArray(keyResults)) {
    for (const kr of keyResults) {
      if (!kr.title?.trim()) continue;
      const krResult = await db.execute(sql`
        INSERT INTO okr_key_result (objective_id, title, target_value, unit)
        VALUES (${objective.id}, ${kr.title.trim()}, ${kr.targetValue || 100}, ${kr.unit || "%"})
        RETURNING *
      `);
      insertedKeyResults.push(krResult.rows[0]);
    }
  }

  return NextResponse.json({ ...objective, key_results: insertedKeyResults }, { status: 201 });
}
