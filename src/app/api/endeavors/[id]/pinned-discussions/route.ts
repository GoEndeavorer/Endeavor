import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.execute(sql`
    SELECT
      d.id,
      d.content,
      d.created_at,
      d.pinned,
      u.name as author_name,
      u.image as author_image,
      (SELECT COUNT(*) FROM discussion r WHERE r.parent_id = d.id) as reply_count
    FROM discussion d
    JOIN "user" u ON d.author_id = u.id
    WHERE d.endeavor_id = ${id} AND d.pinned = true AND d.parent_id IS NULL
    ORDER BY d.created_at DESC
    LIMIT 5
  `);

  return NextResponse.json(result.rows);
}
