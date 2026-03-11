import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    const popular = await db.execute(sql`
      SELECT DISTINCT unnest(needs) as term
      FROM endeavor
      WHERE needs IS NOT NULL AND status IN ('open', 'in-progress')
      LIMIT 10
    `);

    return NextResponse.json({
      suggestions: popular.rows.map((r) => (r as { term: string }).term),
    });
  }

  const results = await db.execute(sql`
    SELECT DISTINCT suggestion FROM (
      SELECT title as suggestion, 1 as priority FROM endeavor
      WHERE title ILIKE ${'%' + q + '%'} AND status IN ('open', 'in-progress')
      LIMIT 3
      UNION ALL
      SELECT DISTINCT unnest(needs) as suggestion, 2 as priority FROM endeavor
      WHERE EXISTS (SELECT 1 FROM unnest(needs) n WHERE n ILIKE ${'%' + q + '%'})
      AND status IN ('open', 'in-progress')
      LIMIT 3
      UNION ALL
      SELECT name as suggestion, 3 as priority FROM "user"
      WHERE name ILIKE ${'%' + q + '%'}
      LIMIT 3
    ) sub
    ORDER BY priority
    LIMIT 8
  `);

  return NextResponse.json({
    suggestions: results.rows.map((r) => (r as { suggestion: string }).suggestion),
  });
}
