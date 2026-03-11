import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, user, member, story, discussion } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — public platform stats (v1 API)
export async function GET() {
  const [stats] = await Promise.all([
    db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM endeavor WHERE status != 'draft') as total_endeavors,
        (SELECT COUNT(*)::int FROM endeavor WHERE status = 'open') as open_endeavors,
        (SELECT COUNT(*)::int FROM endeavor WHERE status = 'in-progress') as active_endeavors,
        (SELECT COUNT(*)::int FROM endeavor WHERE status = 'completed') as completed_endeavors,
        (SELECT COUNT(*)::int FROM "user") as total_users,
        (SELECT COUNT(*)::int FROM member WHERE status = 'approved') as total_memberships,
        (SELECT COUNT(*)::int FROM story WHERE published = true) as published_stories,
        (SELECT COUNT(*)::int FROM discussion) as total_discussions,
        (SELECT COUNT(DISTINCT category) FROM endeavor WHERE status != 'draft') as categories_used
    `),
  ]);

  const data = stats.rows[0] as Record<string, number>;

  return NextResponse.json({
    platform: "Endeavor",
    version: "0.17.0",
    stats: data,
    generated_at: new Date().toISOString(),
  }, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
