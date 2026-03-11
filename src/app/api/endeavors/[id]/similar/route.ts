import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [current] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!current) {
    return NextResponse.json([]);
  }

  // Find similar endeavors by category + needs overlap, excluding cancelled/draft
  const similar = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.category,
      e.status,
      e.image_url,
      e.location_type,
      (SELECT COUNT(*)::int FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') as member_count,
      CASE WHEN e.category = ${current.category} THEN 3 ELSE 0 END +
      CASE
        WHEN e.needs IS NOT NULL AND ${current.needs}::text[] IS NOT NULL
          THEN COALESCE(array_length(ARRAY(
            SELECT unnest(e.needs) INTERSECT SELECT unnest(${current.needs}::text[])
          ), 1), 0)
        ELSE 0
      END as relevance_score
    FROM endeavor e
    WHERE e.id != ${id}
      AND e.status IN ('open', 'in-progress')
    ORDER BY relevance_score DESC, e.created_at DESC
    LIMIT 6
  `);

  return NextResponse.json(similar.rows);
}
