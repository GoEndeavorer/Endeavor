import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, task, discussion, milestone, payment, story } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, count, sql, gte, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Only creator can view insights
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only creator can view insights" }, { status: 403 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    [totalMembers],
    [pendingMembers],
    [recentMembers],
    [totalTasks],
    [completedTasks],
    [totalDiscussions],
    [recentDiscussions],
    [totalMilestones],
    [completedMilestones],
    [totalPayments],
    [totalStories],
  ] = await Promise.all([
    db.select({ count: count() }).from(member).where(and(eq(member.endeavorId, id), eq(member.status, "approved"))),
    db.select({ count: count() }).from(member).where(and(eq(member.endeavorId, id), eq(member.status, "pending"))),
    db.select({ count: count() }).from(member).where(and(eq(member.endeavorId, id), eq(member.status, "approved"), gte(member.joinedAt, sevenDaysAgo))),
    db.select({ count: count() }).from(task).where(eq(task.endeavorId, id)),
    db.select({ count: count() }).from(task).where(and(eq(task.endeavorId, id), eq(task.status, "done"))),
    db.select({ count: count() }).from(discussion).where(eq(discussion.endeavorId, id)),
    db.select({ count: count() }).from(discussion).where(and(eq(discussion.endeavorId, id), gte(discussion.createdAt, sevenDaysAgo))),
    db.select({ count: count() }).from(milestone).where(eq(milestone.endeavorId, id)),
    db.select({ count: count() }).from(milestone).where(and(eq(milestone.endeavorId, id), eq(milestone.completed, true))),
    db.select({ count: count() }).from(payment).where(and(eq(payment.endeavorId, id), eq(payment.status, "completed"))),
    db.select({ count: count() }).from(story).where(and(eq(story.endeavorId, id), eq(story.published, true))),
  ]);

  // Average time from task creation to completion (in days)
  const avgCompletionTime = await db.execute(sql`
    SELECT COALESCE(
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400),
      0
    )::float as avg_days
    FROM task
    WHERE endeavor_id = ${id} AND task_status = 'done'
  `);

  // Most active day of the week (by discussion posts)
  const mostActiveDay = await db.execute(sql`
    SELECT
      EXTRACT(DOW FROM created_at)::int as day_of_week,
      COUNT(*)::int as post_count
    FROM discussion
    WHERE endeavor_id = ${id}
    GROUP BY day_of_week
    ORDER BY post_count DESC
    LIMIT 1
  `);

  // Member retention rate (approved vs total who ever applied)
  const [[totalApplied], [totalApproved]] = await Promise.all([
    db.select({ count: count() }).from(member).where(eq(member.endeavorId, id)),
    db.select({ count: count() }).from(member).where(and(eq(member.endeavorId, id), eq(member.status, "approved"))),
  ]);

  // Revenue
  const [revenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(payment)
    .where(and(eq(payment.endeavorId, id), eq(payment.status, "completed")));

  // Member growth by week
  const memberGrowth = await db.execute(sql`
    SELECT date_trunc('week', joined_at)::date as week, COUNT(*)::int as count
    FROM member
    WHERE endeavor_id = ${id} AND status = 'approved'
    AND joined_at >= ${thirtyDaysAgo.toISOString()}::timestamp
    GROUP BY week
    ORDER BY week
  `);

  // Most active members
  const activeMembers = await db.execute(sql`
    SELECT u.name, u.id,
      (SELECT COUNT(*) FROM discussion d WHERE d.author_id = u.id AND d.endeavor_id = ${id})::int as messages,
      (SELECT COUNT(*) FROM task t WHERE t.assignee_id = u.id AND t.endeavor_id = ${id} AND t.task_status = 'done')::int as tasks_done
    FROM member m
    JOIN "user" u ON m.user_id = u.id
    WHERE m.endeavor_id = ${id} AND m.status = 'approved'
    ORDER BY messages + tasks_done DESC
    LIMIT 5
  `);

  return NextResponse.json({
    members: {
      total: totalMembers.count,
      pending: pendingMembers.count,
      newThisWeek: recentMembers.count,
    },
    tasks: {
      total: totalTasks.count,
      completed: completedTasks.count,
      completionRate: totalTasks.count > 0
        ? Math.round((completedTasks.count / totalTasks.count) * 100)
        : 0,
    },
    discussions: {
      total: totalDiscussions.count,
      thisWeek: recentDiscussions.count,
    },
    milestones: {
      total: totalMilestones.count,
      completed: completedMilestones.count,
    },
    revenue: {
      total: Number(revenue.total) / 100,
      transactions: totalPayments.count,
    },
    stories: totalStories.count,
    memberGrowth: memberGrowth.rows,
    topContributors: activeMembers.rows,
    avgTaskCompletionDays: Math.round(((avgCompletionTime.rows[0] as { avg_days: number })?.avg_days ?? 0) * 10) / 10,
    mostActiveDayOfWeek: mostActiveDay.rows.length > 0
      ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
          (mostActiveDay.rows[0] as { day_of_week: number }).day_of_week
        ]
      : null,
    memberRetentionRate: totalApplied.count > 0
      ? Math.round((totalApproved.count / totalApplied.count) * 100)
      : 0,
    createdAt: end.createdAt,
    daysSinceCreation: Math.floor((now.getTime() - new Date(end.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  });
}
