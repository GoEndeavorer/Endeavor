import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list platform feedback (admin) or user's own feedback
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS platform_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      votes INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_vote (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      feedback_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(feedback_id, user_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT
      f.*,
      u.name as author_name,
      u.image as author_image,
      EXISTS(SELECT 1 FROM feedback_vote fv WHERE fv.feedback_id = f.id AND fv.user_id = ${session.user.id}) as user_voted
    FROM platform_feedback f
    JOIN "user" u ON f.user_id = u.id
    ORDER BY f.votes DESC, f.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

// POST - submit feedback
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS platform_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      votes INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO platform_feedback (user_id, title, description, category)
    VALUES (${session.user.id}, ${title.trim()}, ${description || null}, ${category || "general"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
