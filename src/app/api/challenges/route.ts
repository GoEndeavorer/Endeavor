import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "active";

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS challenge (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      difficulty TEXT NOT NULL DEFAULT 'medium',
      start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      end_date TIMESTAMPTZ,
      max_participants INT,
      xp_reward INT NOT NULL DEFAULT 50,
      status TEXT NOT NULL DEFAULT 'active',
      participant_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS challenge_participant (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      challenge_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      progress INT NOT NULL DEFAULT 0,
      completed BOOLEAN NOT NULL DEFAULT false,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      UNIQUE(challenge_id, user_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT c.*, u.name as creator_name, u.image as creator_image
    FROM challenge c
    JOIN "user" u ON c.creator_id = u.id
    WHERE c.status = ${status}
    ORDER BY c.created_at DESC LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category, difficulty, endDate, maxParticipants, xpReward } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS challenge (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      difficulty TEXT NOT NULL DEFAULT 'medium',
      start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      end_date TIMESTAMPTZ,
      max_participants INT,
      xp_reward INT NOT NULL DEFAULT 50,
      status TEXT NOT NULL DEFAULT 'active',
      participant_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO challenge (creator_id, title, description, category, difficulty, end_date, max_participants, xp_reward)
    VALUES (${session.user.id}, ${title.trim()}, ${description || null}, ${category || "general"}, ${difficulty || "medium"}, ${endDate || null}, ${maxParticipants || null}, ${xpReward || 50})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
