import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await db.execute(sql`
    SELECT
      e.id,
      e.content AS message,
      e.created_at AS "createdAt",
      e.endeavor_id AS "endeavorId",
      en.title AS "endeavorTitle",
      e.author_id AS "endorserId",
      u.name AS "endorserName",
      u.image AS "endorserImage"
    FROM endorsement e
    INNER JOIN endeavor en ON en.id = e.endeavor_id
    INNER JOIN "user" u ON u.id = e.author_id
    ORDER BY e.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}
