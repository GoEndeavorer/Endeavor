import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Aggregate weekly stats
  const [newEndeavors, newMembers, newStories, newDiscussions, topEndeavors] = await Promise.all([
    // New endeavors this week
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM endeavor
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    `),
    // New members this week
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM "user"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    `),
    // New stories this week
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM story
      WHERE "createdAt" >= NOW() - INTERVAL '7 days' AND published = true
    `),
    // Discussions on user's endeavors
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM discussion_post dp
      JOIN endeavor e ON dp.endeavor_id = e.id
      WHERE dp.created_at >= NOW() - INTERVAL '7 days'
        AND (e."creatorId" = ${userId} OR EXISTS (
          SELECT 1 FROM endeavor_member em WHERE em.endeavor_id = e.id AND em.user_id = ${userId}
        ))
    `),
    // Top endeavors this week by activity
    db.execute(sql`
      SELECT e.id, e.title, e.category, COUNT(dp.id)::int as activity_count
      FROM endeavor e
      LEFT JOIN discussion_post dp ON dp.endeavor_id = e.id
        AND dp.created_at >= NOW() - INTERVAL '7 days'
      WHERE e.status IN ('open', 'in-progress')
      GROUP BY e.id, e.title, e.category
      ORDER BY activity_count DESC
      LIMIT 5
    `),
  ]);

  return NextResponse.json({
    period: "week",
    stats: {
      new_endeavors: (newEndeavors.rows[0] as { count: number }).count,
      new_members: (newMembers.rows[0] as { count: number }).count,
      new_stories: (newStories.rows[0] as { count: number }).count,
      discussions_on_your_projects: (newDiscussions.rows[0] as { count: number }).count,
    },
    top_endeavors: topEndeavors.rows,
  });
}
