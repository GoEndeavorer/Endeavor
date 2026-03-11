import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await db.execute(sql`
    SELECT
      e.*,
      u.name AS from_name,
      u.image AS from_image,
      t.name AS to_name
    FROM endorsement e
    JOIN "user" u ON e.author_id = u.id
    JOIN endeavor en ON e.endeavor_id = en.id
    JOIN "user" t ON en.creator_id = t.id
    ORDER BY e.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}
