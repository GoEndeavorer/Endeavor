import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify user is creator
  const [end] = await db
    .select({ creatorId: endeavor.creatorId, title: endeavor.title })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get member growth over time (last 30 days)
  const memberGrowth = await db.execute(sql`
    SELECT
      DATE(m.joined_at) as date,
      COUNT(*) as count
    FROM member m
    WHERE m.endeavor_id = ${id}
      AND m.status = 'approved'
      AND m.joined_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(m.joined_at)
    ORDER BY date
  `);

  // Get discussion activity (last 30 days)
  const discussionActivity = await db.execute(sql`
    SELECT
      DATE(d.created_at) as date,
      COUNT(*) as count
    FROM discussion d
    WHERE d.endeavor_id = ${id}
      AND d.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(d.created_at)
    ORDER BY date
  `);

  // Get task completion rate
  const taskStats = await db.execute(sql`
    SELECT
      status,
      COUNT(*) as count
    FROM task
    WHERE endeavor_id = ${id}
    GROUP BY status
  `);

  // Get top contributors (by discussion posts + tasks completed)
  const topContributors = await db.execute(sql`
    SELECT
      u.id,
      u.name,
      u.image,
      COALESCE(d.discussion_count, 0) as discussions,
      COALESCE(t.task_count, 0) as tasks_done
    FROM member m
    JOIN "user" u ON u.id = m.user_id
    LEFT JOIN (
      SELECT author_id, COUNT(*) as discussion_count
      FROM discussion
      WHERE endeavor_id = ${id}
      GROUP BY author_id
    ) d ON d.author_id = u.id
    LEFT JOIN (
      SELECT assignee_id, COUNT(*) as task_count
      FROM task
      WHERE endeavor_id = ${id} AND status = 'done'
      GROUP BY assignee_id
    ) t ON t.assignee_id = u.id
    WHERE m.endeavor_id = ${id} AND m.status = 'approved'
    ORDER BY (COALESCE(d.discussion_count, 0) + COALESCE(t.task_count, 0)) DESC
    LIMIT 10
  `);

  // Get milestone progress
  const milestoneStats = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE completed = true) as completed,
      COUNT(*) as total
    FROM milestone
    WHERE endeavor_id = ${id}
  `);

  // Page views (approximate from invite link use counts)
  const inviteStats = await db.execute(sql`
    SELECT
      COALESCE(SUM(use_count), 0) as total_invite_views,
      COUNT(*) as active_links
    FROM invite_link
    WHERE endeavor_id = ${id}
  `);

  return NextResponse.json({
    memberGrowth: memberGrowth.rows,
    discussionActivity: discussionActivity.rows,
    taskStats: taskStats.rows,
    topContributors: topContributors.rows,
    milestoneStats: milestoneStats.rows[0] || { completed: 0, total: 0 },
    inviteStats: inviteStats.rows[0] || { total_invite_views: 0, active_links: 0 },
  });
}
