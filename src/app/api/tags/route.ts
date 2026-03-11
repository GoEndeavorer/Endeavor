import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { sql, eq, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Get popular tags (derived from endeavor needs)
export async function GET() {
  // Aggregate all needs across endeavors as "tags"
  const result = await db.execute(sql`
    SELECT unnest(needs) as tag, COUNT(*) as count
    FROM endeavor
    WHERE needs IS NOT NULL AND array_length(needs, 1) > 0
    AND status != 'cancelled'
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 30
  `);

  return NextResponse.json(
    result.rows.map((r: Record<string, unknown>) => ({
      tag: String(r.tag),
      count: Number(r.count),
    }))
  );
}
