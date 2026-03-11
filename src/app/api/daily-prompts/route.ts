import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS daily_prompt (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'reflection',
      active_date DATE NOT NULL DEFAULT CURRENT_DATE,
      response_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS prompt_response (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(prompt_id, user_id)
    )
  `);

  // Get today's prompt
  const todayResult = await db.execute(sql`
    SELECT * FROM daily_prompt WHERE active_date = CURRENT_DATE LIMIT 1
  `);

  if (todayResult.rows.length > 0) {
    // Get responses
    const responses = await db.execute(sql`
      SELECT pr.*, u.name as user_name, u.image as user_image
      FROM prompt_response pr
      JOIN "user" u ON pr.user_id = u.id
      WHERE pr.prompt_id = ${(todayResult.rows[0] as { id: string }).id}
      ORDER BY pr.created_at DESC LIMIT 20
    `);
    return NextResponse.json({ prompt: todayResult.rows[0], responses: responses.rows });
  }

  // Get recent prompts for archive
  const recentResult = await db.execute(sql`
    SELECT * FROM daily_prompt ORDER BY active_date DESC LIMIT 7
  `);

  return NextResponse.json({ prompt: null, recent: recentResult.rows });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { promptId, body } = await request.json();
  if (!promptId || !body?.trim()) {
    return NextResponse.json({ error: "Prompt ID and response required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS prompt_response (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(prompt_id, user_id)
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO prompt_response (prompt_id, user_id, body)
    VALUES (${promptId}, ${session.user.id}, ${body.trim()})
    ON CONFLICT (prompt_id, user_id) DO UPDATE SET body = EXCLUDED.body
    RETURNING *
  `);

  // Update response count
  await db.execute(sql`
    UPDATE daily_prompt SET response_count = (
      SELECT COUNT(*) FROM prompt_response WHERE prompt_id = ${promptId}
    ) WHERE id = ${promptId}
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
