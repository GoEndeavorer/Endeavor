import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS project_template (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      config JSONB NOT NULL DEFAULT '{}',
      use_count INT NOT NULL DEFAULT 0,
      is_official BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (category) {
    result = await db.execute(sql`
      SELECT pt.*, u.name as creator_name
      FROM project_template pt
      JOIN "user" u ON pt.creator_id = u.id
      WHERE pt.category = ${category}
      ORDER BY pt.is_official DESC, pt.use_count DESC
    `);
  } else {
    result = await db.execute(sql`
      SELECT pt.*, u.name as creator_name
      FROM project_template pt
      JOIN "user" u ON pt.creator_id = u.id
      ORDER BY pt.is_official DESC, pt.use_count DESC
      LIMIT 50
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category, config } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS project_template (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      config JSONB NOT NULL DEFAULT '{}',
      use_count INT NOT NULL DEFAULT 0,
      is_official BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO project_template (creator_id, title, description, category, config)
    VALUES (${session.user.id}, ${title.trim()}, ${description || null}, ${category || "general"}, ${JSON.stringify(config || {})})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
