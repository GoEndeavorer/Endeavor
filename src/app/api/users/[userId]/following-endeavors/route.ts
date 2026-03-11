import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Get endeavors the user is watching/following
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS endeavor_watcher (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(endeavor_id, user_id)
    )
  `);

  const result = await db.execute(sql`
    SELECT e.id, e.title, e.category, e.status, e."imageUrl",
      e."createdAt", e."updatedAt"
    FROM endeavor_watcher ew
    JOIN endeavor e ON ew.endeavor_id = e.id
    WHERE ew.user_id = ${userId}
    ORDER BY ew.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}
