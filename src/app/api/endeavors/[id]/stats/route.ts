import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM member WHERE endeavor_id = ${id} AND status = 'approved')::int as "memberCount",
      (SELECT COUNT(*) FROM task WHERE endeavor_id = ${id})::int as "totalTasks",
      (SELECT COUNT(*) FROM task WHERE endeavor_id = ${id} AND status = 'done')::int as "completedTasks",
      (SELECT COUNT(*) FROM discussion WHERE endeavor_id = ${id})::int as "discussionCount",
      (SELECT COUNT(*) FROM milestone WHERE endeavor_id = ${id})::int as "totalMilestones",
      (SELECT COUNT(*) FROM milestone WHERE endeavor_id = ${id} AND completed = true)::int as "completedMilestones",
      (SELECT COUNT(*) FROM story WHERE endeavor_id = ${id} AND published = true)::int as "storyCount",
      (SELECT COUNT(*) FROM saved_endeavor WHERE endeavor_id = ${id})::int as "watcherCount",
      (SELECT COUNT(*) FROM member WHERE endeavor_id = ${id} AND joined_at > NOW() - INTERVAL '7 days')::int as "newMembersWeek",
      (SELECT COUNT(*) FROM discussion WHERE endeavor_id = ${id} AND created_at > NOW() - INTERVAL '7 days')::int as "newDiscussionsWeek"
  `);

  const row = result.rows[0] as {
    memberCount: number;
    totalTasks: number;
    completedTasks: number;
    discussionCount: number;
    totalMilestones: number;
    completedMilestones: number;
    storyCount: number;
    watcherCount: number;
    newMembersWeek: number;
    newDiscussionsWeek: number;
  };

  return NextResponse.json({
    members: row.memberCount,
    tasks: { total: row.totalTasks, completed: row.completedTasks },
    discussions: row.discussionCount,
    milestones: { total: row.totalMilestones, completed: row.completedMilestones },
    stories: row.storyCount,
    watchers: row.watcherCount,
    thisWeek: {
      newMembers: row.newMembersWeek,
      newDiscussions: row.newDiscussionsWeek,
    },
  });
}
