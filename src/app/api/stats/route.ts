import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user, story, task, discussion } from "@/lib/db/schema";
import { count, eq, and, sql, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    [totalUsers],
    [totalEndeavors],
    [openEndeavors],
    [completedEndeavors],
    [totalMembers],
    [totalStories],
    [totalTasks],
    [tasksDone],
    [totalDiscussions],
    [newUsersMonth],
    [newEndeavorsWeek],
  ] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(endeavor),
    db.select({ count: count() }).from(endeavor).where(eq(endeavor.status, "open")),
    db.select({ count: count() }).from(endeavor).where(eq(endeavor.status, "completed")),
    db.select({ count: count() }).from(member).where(eq(member.status, "approved")),
    db.select({ count: count() }).from(story).where(eq(story.published, true)),
    db.select({ count: count() }).from(task),
    db.select({ count: count() }).from(task).where(eq(task.status, "done")),
    db.select({ count: count() }).from(discussion),
    db.select({ count: count() }).from(user).where(gte(user.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(endeavor).where(gte(endeavor.createdAt, sevenDaysAgo)),
  ]);

  return NextResponse.json({
    users: totalUsers.count,
    endeavors: totalEndeavors.count,
    openEndeavors: openEndeavors.count,
    completedEndeavors: completedEndeavors.count,
    memberships: totalMembers.count,
    stories: totalStories.count,
    tasks: totalTasks.count,
    tasksDone: tasksDone.count,
    discussions: totalDiscussions.count,
    newUsersMonth: newUsersMonth.count,
    newEndeavorsWeek: newEndeavorsWeek.count,
  });
}
