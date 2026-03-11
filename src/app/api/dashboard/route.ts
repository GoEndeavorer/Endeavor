import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  endeavor,
  member,
  task,
  notification,
  discussion,
  story,
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Run all queries in parallel
  const [
    createdEndeavors,
    joinedMemberships,
    pendingTasks,
    unreadNotifications,
    recentNotifications,
    completedTaskCount,
    discussionCount,
    storyCount,
  ] = await Promise.all([
    // Endeavors the user created
    db
      .select({
        id: endeavor.id,
        title: endeavor.title,
        status: endeavor.status,
        category: endeavor.category,
        imageUrl: endeavor.imageUrl,
        createdAt: endeavor.createdAt,
      })
      .from(endeavor)
      .where(eq(endeavor.creatorId, userId))
      .orderBy(desc(endeavor.createdAt)),

    // Endeavors the user joined (not as creator)
    db
      .select({
        id: endeavor.id,
        title: endeavor.title,
        status: endeavor.status,
        category: endeavor.category,
        imageUrl: endeavor.imageUrl,
        createdAt: endeavor.createdAt,
        role: member.role,
      })
      .from(member)
      .innerJoin(endeavor, eq(member.endeavorId, endeavor.id))
      .where(
        and(
          eq(member.userId, userId),
          eq(member.status, "approved"),
          eq(member.role, "collaborator")
        )
      )
      .orderBy(desc(endeavor.createdAt)),

    // Pending tasks assigned to user
    db
      .select({
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        endeavorId: task.endeavorId,
        endeavorTitle: endeavor.title,
        createdAt: task.createdAt,
      })
      .from(task)
      .innerJoin(endeavor, eq(task.endeavorId, endeavor.id))
      .where(
        and(
          eq(task.assigneeId, userId),
          sql`${task.status} != 'done'`
        )
      )
      .orderBy(desc(task.createdAt))
      .limit(10),

    // Unread notification count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notification)
      .where(
        and(eq(notification.userId, userId), eq(notification.read, false))
      ),

    // Recent notifications for activity feed
    db
      .select({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        endeavorId: notification.endeavorId,
        read: notification.read,
        createdAt: notification.createdAt,
      })
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(10),

    // Completed task count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(task)
      .where(
        and(eq(task.assigneeId, userId), eq(task.status, "done"))
      ),

    // Discussion count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(discussion)
      .where(eq(discussion.authorId, userId)),

    // Story count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(story)
      .where(eq(story.authorId, userId)),
  ]);

  // Merge created + joined endeavors
  const allEndeavors = [
    ...createdEndeavors.map((e) => ({ ...e, role: "creator" as const })),
    ...joinedMemberships,
  ];

  // Status counts
  const statusCounts = {
    open: allEndeavors.filter((e) => e.status === "open").length,
    "in-progress": allEndeavors.filter((e) => e.status === "in-progress").length,
    completed: allEndeavors.filter((e) => e.status === "completed").length,
    draft: allEndeavors.filter((e) => e.status === "draft").length,
    cancelled: allEndeavors.filter((e) => e.status === "cancelled").length,
  };

  return NextResponse.json({
    endeavors: allEndeavors,
    statusCounts,
    pendingTasks,
    unreadNotifications: unreadNotifications[0]?.count ?? 0,
    recentActivity: recentNotifications,
    stats: {
      totalEndeavors: allEndeavors.length,
      tasksCompleted: completedTaskCount[0]?.count ?? 0,
      discussionsPosted: discussionCount[0]?.count ?? 0,
      storiesWritten: storyCount[0]?.count ?? 0,
    },
  });
}
