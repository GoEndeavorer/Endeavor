import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, discussion, task } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — most active endeavors by recent activity (discussions + tasks in last 7 days)
export async function GET() {
  const result = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.category,
      e.image_url,
      e.status,
      (
        SELECT COUNT(*)::int FROM discussion d
        WHERE d.endeavor_id = e.id AND d.created_at > NOW() - INTERVAL '7 days'
      ) +
      (
        SELECT COUNT(*)::int FROM task t
        WHERE t.endeavor_id = e.id AND t.created_at > NOW() - INTERVAL '7 days'
      ) as activity_score,
      (SELECT COUNT(*)::int FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') as member_count
    FROM endeavor e
    WHERE e.status IN ('open', 'in-progress')
    ORDER BY activity_score DESC, member_count DESC
    LIMIT 10
  `);

  return NextResponse.json(result.rows);
}
