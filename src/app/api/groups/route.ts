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
    CREATE TABLE IF NOT EXISTS community_group (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      privacy TEXT NOT NULL DEFAULT 'public',
      avatar_url TEXT,
      member_count INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS group_member (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(group_id, user_id)
    )
  `);

  let result;
  if (category) {
    result = await db.execute(sql`
      SELECT g.*, u.name as creator_name
      FROM community_group g
      JOIN "user" u ON g.creator_id = u.id
      WHERE g.category = ${category} AND g.privacy = 'public'
      ORDER BY g.member_count DESC LIMIT 50
    `);
  } else {
    result = await db.execute(sql`
      SELECT g.*, u.name as creator_name
      FROM community_group g
      JOIN "user" u ON g.creator_id = u.id
      WHERE g.privacy = 'public'
      ORDER BY g.member_count DESC LIMIT 50
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, category, privacy } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Group name required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS community_group (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      privacy TEXT NOT NULL DEFAULT 'public',
      avatar_url TEXT,
      member_count INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS group_member (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(group_id, user_id)
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO community_group (creator_id, name, description, category, privacy)
    VALUES (${session.user.id}, ${name.trim()}, ${description || null}, ${category || "general"}, ${privacy || "public"})
    RETURNING *
  `);

  const group = result.rows[0] as { id: string };

  // Creator auto-joins as admin
  await db.execute(sql`
    INSERT INTO group_member (group_id, user_id, role)
    VALUES (${group.id}, ${session.user.id}, 'admin')
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
