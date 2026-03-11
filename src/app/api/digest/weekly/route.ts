import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  endeavor,
  member,
  task,
  discussion,
  milestone,
  follow,
  endorsement,
  user,
} from "@/lib/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    joinedEndeavors,
    createdEndeavors,
    completedTasks,
    discussionsPosted,
    milestonesHit,
    newFollowers,
    upcomingTasks,
    recentEndorsements,
    userInfo,
  ] = await Promise.all([
    // Endeavors joined in the last 7 days
    db
      .select({
        id: endeavor.id,
        title: endeavor.title,
        category: endeavor.category,
        imageUrl: endeavor.imageUrl,
        joinedAt: member.joinedAt,
      })
      .from(member)
      .innerJoin(endeavor, eq(member.endeavorId, endeavor.id))
      .where(
        and(
          eq(member.userId, userId),
          eq(member.status, "approved"),
          eq(member.role, "collaborator"),
          gte(member.joinedAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(member.joinedAt)),

    // Endeavors created in the last 7 days
    db
      .select({
        id: endeavor.id,
        title: endeavor.title,
        category: endeavor.category,
        imageUrl: endeavor.imageUrl,
        createdAt: endeavor.createdAt,
      })
      .from(endeavor)
      .where(
        and(
          eq(endeavor.creatorId, userId),
          gte(endeavor.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(endeavor.createdAt)),

    // Tasks completed in the last 7 days
    db
      .select({
        id: task.id,
        title: task.title,
        endeavorId: task.endeavorId,
        endeavorTitle: endeavor.title,
        updatedAt: task.updatedAt,
      })
      .from(task)
      .innerJoin(endeavor, eq(task.endeavorId, endeavor.id))
      .where(
        and(
          eq(task.assigneeId, userId),
          eq(task.status, "done"),
          gte(task.updatedAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(task.updatedAt)),

    // Discussions posted in the last 7 days
    db
      .select({
        id: discussion.id,
        content: discussion.content,
        endeavorId: discussion.endeavorId,
        endeavorTitle: endeavor.title,
        createdAt: discussion.createdAt,
      })
      .from(discussion)
      .innerJoin(endeavor, eq(discussion.endeavorId, endeavor.id))
      .where(
        and(
          eq(discussion.authorId, userId),
          gte(discussion.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(discussion.createdAt)),

    // Milestones completed in the last 7 days (across user's endeavors)
    db
      .select({
        id: milestone.id,
        title: milestone.title,
        endeavorId: milestone.endeavorId,
        endeavorTitle: endeavor.title,
        completedAt: milestone.completedAt,
      })
      .from(milestone)
      .innerJoin(endeavor, eq(milestone.endeavorId, endeavor.id))
      .innerJoin(member, eq(member.endeavorId, endeavor.id))
      .where(
        and(
          eq(member.userId, userId),
          eq(member.status, "approved"),
          eq(milestone.completed, true),
          gte(milestone.completedAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(milestone.completedAt)),

    // New followers in the last 7 days
    db
      .select({
        id: follow.id,
        followerId: follow.followerId,
        followerName: user.name,
        followerImage: user.image,
        createdAt: follow.createdAt,
      })
      .from(follow)
      .innerJoin(user, eq(follow.followerId, user.id))
      .where(
        and(
          eq(follow.followingId, userId),
          gte(follow.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(follow.createdAt)),

    // Upcoming tasks (not done, due within 7 days from now)
    db
      .select({
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
        endeavorId: task.endeavorId,
        endeavorTitle: endeavor.title,
      })
      .from(task)
      .innerJoin(endeavor, eq(task.endeavorId, endeavor.id))
      .where(
        and(
          eq(task.assigneeId, userId),
          sql`${task.status} != 'done'`,
          sql`${task.dueDate} IS NOT NULL`,
          sql`${task.dueDate} <= ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}`
        )
      )
      .orderBy(task.dueDate)
      .limit(10),

    // Recent endorsements received on user's endeavors
    db
      .select({
        id: endorsement.id,
        content: endorsement.content,
        rating: endorsement.rating,
        authorName: user.name,
        authorImage: user.image,
        endeavorId: endorsement.endeavorId,
        endeavorTitle: endeavor.title,
        createdAt: endorsement.createdAt,
      })
      .from(endorsement)
      .innerJoin(user, eq(endorsement.authorId, user.id))
      .innerJoin(endeavor, eq(endorsement.endeavorId, endeavor.id))
      .where(
        and(
          eq(endeavor.creatorId, userId),
          gte(endorsement.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(endorsement.createdAt))
      .limit(5),

    // User info for greeting
    db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
  ]);

  // Determine top performing endeavor (most combined activity)
  const activityByEndeavor: Record<
    string,
    { id: string; title: string; category: string; imageUrl: string | null; count: number }
  > = {};

  const trackActivity = (endeavorId: string, title: string, category?: string, imageUrl?: string | null) => {
    if (!activityByEndeavor[endeavorId]) {
      activityByEndeavor[endeavorId] = {
        id: endeavorId,
        title,
        category: category || "",
        imageUrl: imageUrl || null,
        count: 0,
      };
    }
    activityByEndeavor[endeavorId].count++;
  };

  for (const t of completedTasks) trackActivity(t.endeavorId, t.endeavorTitle);
  for (const d of discussionsPosted) trackActivity(d.endeavorId, d.endeavorTitle);
  for (const m of milestonesHit) trackActivity(m.endeavorId, m.endeavorTitle);

  const topEndeavor = Object.values(activityByEndeavor).sort(
    (a, b) => b.count - a.count
  )[0] || null;

  const weekStart = sevenDaysAgo.toISOString();
  const weekEnd = new Date().toISOString();

  return NextResponse.json({
    weekStart,
    weekEnd,
    userName: userInfo[0]?.name || "there",
    stats: {
      endeavorsJoined: joinedEndeavors.length,
      endeavorsCreated: createdEndeavors.length,
      tasksCompleted: completedTasks.length,
      discussionsPosted: discussionsPosted.length,
      milestonesHit: milestonesHit.length,
      newFollowers: newFollowers.length,
    },
    joinedEndeavors,
    createdEndeavors,
    completedTasks,
    milestonesHit,
    newFollowers,
    topEndeavor,
    upcomingTasks,
    recentEndorsements,
  });
}
