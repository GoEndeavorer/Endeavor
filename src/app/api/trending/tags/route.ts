import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Get most used tags across endeavors in the last 30 days
  const result = await db.execute(sql`
    SELECT unnest(tags) as tag, COUNT(*) as count
    FROM endeavor
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      AND tags IS NOT NULL AND array_length(tags, 1) > 0
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 30
  `);

  return NextResponse.json(result.rows);
}
