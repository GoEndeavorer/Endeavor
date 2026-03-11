import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [overview, weeklyGrowth, topEndeavors, taskBreakdown] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(DISTINCT e.id) as total_endeavors,
        (SELECT COUNT(*) FROM member m JOIN endeavor e2 ON m.endeavor_id = e2.id WHERE e2.creator_id = ${userId} AND m.status = 'approved') as total_members,
        (SELECT COUNT(*) FROM task t JOIN endeavor e3 ON t.endeavor_id = e3.id WHERE e3.creator_id = ${userId}) as total_tasks,
        (SELECT COUNT(*) FROM task t JOIN endeavor e4 ON t.endeavor_id = e4.id WHERE e4.creator_id = ${userId} AND t.status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM discussion d JOIN endeavor e5 ON d.endeavor_id = e5.id WHERE e5.creator_id = ${userId}) as total_discussions,
        (SELECT COUNT(*) FROM story s JOIN endeavor e6 ON s.endeavor_id = e6.id WHERE e6.creator_id = ${userId} AND s.published = true) as total_stories
      FROM endeavor e
      WHERE e.creator_id = ${userId}
    `),

    db.execute(sql`
      SELECT
        DATE_TRUNC('week', m.joined_at)::date as week,
        COUNT(*) as new_members
      FROM member m
      JOIN endeavor e ON m.endeavor_id = e.id
      WHERE e.creator_id = ${userId}
        AND m.joined_at > NOW() - INTERVAL '8 weeks'
        AND m.status = 'approved'
      GROUP BY DATE_TRUNC('week', m.joined_at)
      ORDER BY week ASC
    `),

    db.execute(sql`
      SELECT
        e.id,
        e.title,
        e.status,
        e.category,
        (SELECT COUNT(*) FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') as member_count,
        (SELECT COUNT(*) FROM task t WHERE t.endeavor_id = e.id) as task_count,
        (SELECT COUNT(*) FROM discussion d WHERE d.endeavor_id = e.id) as discussion_count
      FROM endeavor e
      WHERE e.creator_id = ${userId}
      ORDER BY member_count DESC
      LIMIT 5
    `),

    db.execute(sql`
      SELECT t.status, COUNT(*)::int as count
      FROM task t
      JOIN endeavor e ON t.endeavor_id = e.id
      WHERE e.creator_id = ${userId}
      GROUP BY t.status
      ORDER BY count DESC
    `),
  ]);

  return NextResponse.json({
    overview: overview.rows[0] || {},
    weeklyGrowth: weeklyGrowth.rows,
    topEndeavors: topEndeavors.rows,
    taskBreakdown: taskBreakdown.rows,
  });
}
