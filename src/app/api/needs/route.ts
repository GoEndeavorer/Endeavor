import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list all needs with counts and associated endeavors
export async function GET() {
  const results = await db.execute(sql`
    WITH need_list AS (
      SELECT unnest(needs) as need, id, title, category, status
      FROM endeavor
      WHERE status IN ('open', 'in-progress')
      AND needs IS NOT NULL
      AND array_length(needs, 1) > 0
    )
    SELECT
      need,
      COUNT(DISTINCT id)::int as count,
      json_agg(json_build_object('id', id, 'title', title, 'category', category, 'status', status) ORDER BY title) as endeavors
    FROM need_list
    GROUP BY need
    ORDER BY count DESC
    LIMIT 50
  `);

  return NextResponse.json(results.rows);
}
