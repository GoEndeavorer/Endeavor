import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, task, story, discussion, endorsement } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const [
    [created],
    [joined],
    [tasksDone],
    [storiesPublished],
    [discussions],
    [endorsements],
    streakResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(endeavor).where(eq(endeavor.creatorId, userId)),
    db.select({ count: count() }).from(member).where(and(eq(member.userId, userId), eq(member.status, "approved"))),
    db.select({ count: count() }).from(task).where(and(eq(task.assigneeId, userId), eq(task.status, "done"))),
    db.select({ count: count() }).from(story).where(and(eq(story.authorId, userId), eq(story.published, true))),
    db.select({ count: count() }).from(discussion).where(eq(discussion.authorId, userId)),
    db.select({ count: count() }).from(endorsement).where(eq(endorsement.authorId, userId)),
    // Calculate current streak (consecutive days with activity)
    db.execute(sql`
      WITH daily_activity AS (
        SELECT DISTINCT created_at::date as day FROM discussion WHERE author_id = ${userId}
        UNION
        SELECT DISTINCT created_at::date FROM task WHERE assignee_id = ${userId} AND task_status = 'done'
        UNION
        SELECT DISTINCT created_at::date FROM story WHERE author_id = ${userId} AND published = true
        UNION
        SELECT DISTINCT created_at::date FROM member WHERE user_id = ${userId} AND status = 'approved'
      ),
      streak AS (
        SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::int * INTERVAL '1 day' as grp
        FROM daily_activity
      )
      SELECT COUNT(*)::int as streak_days
      FROM streak
      WHERE grp = (
        SELECT grp FROM streak ORDER BY day DESC LIMIT 1
      )
    `),
  ]);

  const streakDays = streakResult.rows.length > 0 ? (streakResult.rows[0] as { streak_days: number }).streak_days : 0;

  return NextResponse.json({
    endeavorsCreated: created.count,
    endeavorsJoined: joined.count,
    tasksCompleted: tasksDone.count,
    storiesPublished: storiesPublished.count,
    discussionPosts: discussions.count,
    endorsementsGiven: endorsements.count,
    currentStreak: streakDays,
  });
}
