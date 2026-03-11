import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  endeavor,
  member,
  user,
  milestone,
  discussion,
  task,
  update,
} from "@/lib/db/schema";
import { eq, and, gte, desc, sql, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Fetch the current user's interests
  const [currentUser] = await db
    .select({ interests: user.interests })
    .from(user)
    .where(eq(user.id, userId));

  const interests = currentUser?.interests ?? [];

  // Get endeavor IDs the user is a member of (approved)
  const userMemberships = await db
    .select({ endeavorId: member.endeavorId })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.status, "approved")));

  const memberEndeavorIds = userMemberships.map((m) => m.endeavorId);

  // Also include endeavors the user created
  const createdEndeavors = await db
    .select({ id: endeavor.id })
    .from(endeavor)
    .where(eq(endeavor.creatorId, userId));

  const createdEndeavorIds = createdEndeavors.map((e) => e.id);
  const allMyEndeavorIds = [
    ...new Set([...memberEndeavorIds, ...createdEndeavorIds]),
  ];

  // ── 1. New endeavors in categories the user is interested in ───────────
  let newEndeavors: {
    id: string;
    title: string;
    category: string;
    creatorId: string;
    createdAt: Date;
    imageUrl: string | null;
  }[] = [];

  if (interests.length > 0) {
    newEndeavors = await db
      .select({
        id: endeavor.id,
        title: endeavor.title,
        category: endeavor.category,
        creatorId: endeavor.creatorId,
        createdAt: endeavor.createdAt,
        imageUrl: endeavor.imageUrl,
      })
      .from(endeavor)
      .where(
        and(
          inArray(endeavor.category, interests),
          gte(endeavor.createdAt, sevenDaysAgo),
          sql`${endeavor.creatorId} != ${userId}`
        )
      )
      .orderBy(desc(endeavor.createdAt))
      .limit(10);
  }

  // ── 2. Updates from endeavors the user is a member of ──────────────────
  let memberUpdates: {
    id: string;
    title: string;
    content: string;
    endeavorId: string;
    endeavorTitle: string;
    authorId: string;
    createdAt: Date;
  }[] = [];

  if (allMyEndeavorIds.length > 0) {
    memberUpdates = await db
      .select({
        id: update.id,
        title: update.title,
        content: update.content,
        endeavorId: update.endeavorId,
        endeavorTitle: endeavor.title,
        authorId: update.authorId,
        createdAt: update.createdAt,
      })
      .from(update)
      .innerJoin(endeavor, eq(update.endeavorId, endeavor.id))
      .where(
        and(
          inArray(update.endeavorId, allMyEndeavorIds),
          gte(update.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(update.createdAt))
      .limit(20);
  }

  // ── 3. New members who joined the user's endeavors ─────────────────────
  let newMembers: {
    memberId: string;
    userName: string;
    userImage: string | null;
    endeavorId: string;
    endeavorTitle: string;
    joinedAt: Date;
  }[] = [];

  if (allMyEndeavorIds.length > 0) {
    newMembers = await db
      .select({
        memberId: member.id,
        userName: user.name,
        userImage: user.image,
        endeavorId: member.endeavorId,
        endeavorTitle: endeavor.title,
        joinedAt: member.joinedAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .innerJoin(endeavor, eq(member.endeavorId, endeavor.id))
      .where(
        and(
          inArray(member.endeavorId, allMyEndeavorIds),
          eq(member.status, "approved"),
          gte(member.joinedAt, sevenDaysAgo),
          sql`${member.userId} != ${userId}`
        )
      )
      .orderBy(desc(member.joinedAt))
      .limit(20);
  }

  // ── 4. Completed milestones in the user's endeavors ────────────────────
  let milestoneUpdates: {
    id: string;
    title: string;
    description: string | null;
    endeavorId: string;
    endeavorTitle: string;
    completedAt: Date | null;
  }[] = [];

  if (allMyEndeavorIds.length > 0) {
    milestoneUpdates = await db
      .select({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        endeavorId: milestone.endeavorId,
        endeavorTitle: endeavor.title,
        completedAt: milestone.completedAt,
      })
      .from(milestone)
      .innerJoin(endeavor, eq(milestone.endeavorId, endeavor.id))
      .where(
        and(
          inArray(milestone.endeavorId, allMyEndeavorIds),
          eq(milestone.completed, true),
          gte(milestone.completedAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(milestone.completedAt))
      .limit(20);
  }

  // ── 5. Weekly stats ────────────────────────────────────────────────────
  let discussionsThisWeek = 0;
  let tasksCompletedThisWeek = 0;

  if (allMyEndeavorIds.length > 0) {
    const [discussionStat, taskStat] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(discussion)
        .where(
          and(
            inArray(discussion.endeavorId, allMyEndeavorIds),
            gte(discussion.createdAt, sevenDaysAgo)
          )
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(task)
        .where(
          and(
            inArray(task.endeavorId, allMyEndeavorIds),
            eq(task.status, "done"),
            gte(task.updatedAt, sevenDaysAgo)
          )
        ),
    ]);

    discussionsThisWeek = discussionStat[0]?.count ?? 0;
    tasksCompletedThisWeek = taskStat[0]?.count ?? 0;
  }

  return NextResponse.json({
    period: {
      start: sevenDaysAgo.toISOString(),
      end: new Date().toISOString(),
    },
    newEndeavors,
    memberUpdates,
    newMembers,
    milestoneUpdates,
    weeklyStats: {
      totalDiscussions: discussionsThisWeek,
      tasksCompleted: tasksCompletedThisWeek,
    },
  });
}
