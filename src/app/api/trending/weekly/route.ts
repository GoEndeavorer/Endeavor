import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — trending endeavors this week (by new member growth)
export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.category,
      e.status,
      e.image_url,
      e.location_type,
      (SELECT COUNT(*)::int FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') as total_members,
      (SELECT COUNT(*)::int FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved' AND m.joined_at >= ${sevenDaysAgo.toISOString()}::timestamp) as new_members_this_week
    FROM endeavor e
    WHERE e.status IN ('open', 'in-progress')
    ORDER BY new_members_this_week DESC, total_members DESC
    LIMIT 10
  `);

  return NextResponse.json(trending.rows);
}
