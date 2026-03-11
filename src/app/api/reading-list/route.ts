import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - user's reading list (saved stories)
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reading_list (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      story_id UUID NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, story_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT
      rl.id,
      rl.created_at as saved_at,
      s.id as story_id,
      s.title,
      s.content,
      s.created_at,
      u.name as author_name,
      e.title as endeavor_title,
      e.id as endeavor_id
    FROM reading_list rl
    JOIN story s ON rl.story_id = s.id
    JOIN "user" u ON s.author_id = u.id
    JOIN endeavor e ON s.endeavor_id = e.id
    WHERE rl.user_id = ${session.user.id}
    ORDER BY rl.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

// POST - add story to reading list
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storyId } = await request.json();
  if (!storyId) {
    return NextResponse.json({ error: "storyId is required" }, { status: 400 });
  }

  await db.execute(sql`
    INSERT INTO reading_list (user_id, story_id)
    VALUES (${session.user.id}, ${storyId})
    ON CONFLICT (user_id, story_id) DO NOTHING
  `);

  return NextResponse.json({ success: true });
}

// DELETE - remove story from reading list
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storyId } = await request.json();
  if (!storyId) {
    return NextResponse.json({ error: "storyId is required" }, { status: 400 });
  }

  await db.execute(sql`
    DELETE FROM reading_list
    WHERE user_id = ${session.user.id} AND story_id = ${storyId}
  `);

  return NextResponse.json({ success: true });
}
