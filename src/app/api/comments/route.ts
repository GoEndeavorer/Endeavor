import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!targetType || !targetId) {
    return NextResponse.json({ error: "targetType and targetId required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS comment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      body TEXT NOT NULL,
      parent_id UUID,
      vote_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT c.*, u.name as author_name, u.image as author_image
    FROM comment c
    JOIN "user" u ON c.author_id = u.id
    WHERE c.target_type = ${targetType} AND c.target_id = ${targetId}
    ORDER BY c.created_at ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetType, targetId, body, parentId } = await request.json();
  if (!targetType || !targetId || !body?.trim()) {
    return NextResponse.json({ error: "Target and body required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS comment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      body TEXT NOT NULL,
      parent_id UUID,
      vote_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO comment (author_id, target_type, target_id, body, parent_id)
    VALUES (${session.user.id}, ${targetType}, ${targetId}, ${body.trim()}, ${parentId || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
