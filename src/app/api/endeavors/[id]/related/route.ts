import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find related endeavors by same category and overlapping needs
  const result = await db.execute(sql`
    WITH current AS (
      SELECT category, needs, status FROM endeavor WHERE id = ${id}
    )
    SELECT
      e.id,
      e.title,
      e.category,
      e.status,
      e.image_url as "imageUrl",
      (SELECT COUNT(*) FROM member m WHERE m.endeavor_id = e.id)::int as "memberCount",
      CASE
        WHEN e.category = (SELECT category FROM current) THEN 2
        ELSE 0
      END as score
    FROM endeavor e, current c
    WHERE e.id != ${id}
      AND e.status IN ('open', 'in-progress')
      AND (
        e.category = c.category
        OR (e.needs IS NOT NULL AND c.needs IS NOT NULL AND e.needs && c.needs)
      )
    ORDER BY score DESC, e.created_at DESC
    LIMIT 5
  `);

  const related = (result.rows as {
    id: string;
    title: string;
    category: string;
    status: string;
    imageUrl: string | null;
    memberCount: number;
  }[]).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    status: r.status,
    imageUrl: r.imageUrl,
    memberCount: r.memberCount,
  }));

  return NextResponse.json(related);
}
