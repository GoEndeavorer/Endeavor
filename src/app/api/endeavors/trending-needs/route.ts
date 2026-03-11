import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { sql, or, eq } from "drizzle-orm";

// GET /api/endeavors/trending-needs — most wanted skills/needs
export async function GET() {
  const results = await db.execute(sql`
    SELECT n AS need, COUNT(*) AS count
    FROM endeavor, unnest(endeavor.needs) AS n
    WHERE endeavor.status IN ('open', 'in-progress')
    GROUP BY n
    ORDER BY count DESC
    LIMIT 10
  `);

  return NextResponse.json(results.rows || []);
}
