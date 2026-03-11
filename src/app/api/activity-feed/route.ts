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
  const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
  const offset = Number(searchParams.get("offset")) || 0;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS activity_feed_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      type TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      target_title TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT afi.*, u.name as actor_name, u.image as actor_image
    FROM activity_feed_item afi
    JOIN "user" u ON afi.actor_id = u.id
    WHERE afi.user_id = ${session.user.id}
    ORDER BY afi.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return NextResponse.json(result.rows);
}
