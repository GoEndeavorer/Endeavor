import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  discussion,
  task,
  milestone,
  story,
  member,
  payment,
  user,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and, sql } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

export const dynamic = "force-dynamic";

type ActivityItem = {
  type: "member" | "discussion" | "task" | "milestone" | "payment" | "story";
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch recent items from each table in parallel
  const [members, discussions, tasks, milestones, payments, stories] =
    await Promise.all([
      // Members (approved joins)
      db
        .select({
          userId: member.userId,
          userName: user.name,
          role: member.role,
          joinedAt: member.joinedAt,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(
          and(
            eq(member.endeavorId, id),
            eq(member.status, "approved")
          )
        )
        .orderBy(desc(member.joinedAt))
        .limit(50),

      // Discussions (posts)
      db
        .select({
          userId: discussion.authorId,
          userName: user.name,
          content: discussion.content,
          createdAt: discussion.createdAt,
        })
        .from(discussion)
        .innerJoin(user, eq(discussion.authorId, user.id))
        .where(eq(discussion.endeavorId, id))
        .orderBy(desc(discussion.createdAt))
        .limit(50),

      // Tasks (status changes)
      db
        .select({
          userId: task.createdById,
          userName: user.name,
          title: task.title,
          status: task.status,
          updatedAt: task.updatedAt,
        })
        .from(task)
        .innerJoin(user, eq(task.createdById, user.id))
        .where(eq(task.endeavorId, id))
        .orderBy(desc(task.updatedAt))
        .limit(50),

      // Milestones (completions)
      db
        .select({
          title: milestone.title,
          completedAt: milestone.completedAt,
          createdAt: milestone.createdAt,
        })
        .from(milestone)
        .where(
          and(
            eq(milestone.endeavorId, id),
            eq(milestone.completed, true)
          )
        )
        .orderBy(desc(milestone.completedAt))
        .limit(50),

      // Payments (completed)
      db
        .select({
          userId: payment.userId,
          userName: user.name,
          type: payment.type,
          amount: payment.amount,
          createdAt: payment.createdAt,
        })
        .from(payment)
        .innerJoin(user, eq(payment.userId, user.id))
        .where(
          and(
            eq(payment.endeavorId, id),
            sql`${payment.status} = 'completed'`
          )
        )
        .orderBy(desc(payment.createdAt))
        .limit(50),

      // Stories (published)
      db
        .select({
          userId: story.authorId,
          userName: user.name,
          title: story.title,
          createdAt: story.createdAt,
        })
        .from(story)
        .innerJoin(user, eq(story.authorId, user.id))
        .where(
          and(
            eq(story.endeavorId, id),
            eq(story.published, true)
          )
        )
        .orderBy(desc(story.createdAt))
        .limit(50),
    ]);

  // Merge into unified timeline
  const activity: ActivityItem[] = [
    ...members.map((m) => ({
      type: "member" as const,
      description:
        m.role === "creator"
          ? "Created this endeavor"
          : "Joined the endeavor",
      userId: m.userId,
      userName: m.userName,
      timestamp: m.joinedAt.toISOString(),
    })),
    ...discussions.map((d) => ({
      type: "discussion" as const,
      description:
        d.content.length > 120
          ? `Posted: ${d.content.slice(0, 120)}...`
          : `Posted: ${d.content}`,
      userId: d.userId,
      userName: d.userName,
      timestamp: d.createdAt.toISOString(),
    })),
    ...tasks.map((t) => ({
      type: "task" as const,
      description: `Task "${t.title}" marked as ${t.status}`,
      userId: t.userId,
      userName: t.userName,
      timestamp: t.updatedAt.toISOString(),
    })),
    ...milestones.map((m) => ({
      type: "milestone" as const,
      description: `Milestone completed: ${m.title}`,
      userId: "",
      userName: "",
      timestamp: (m.completedAt ?? m.createdAt).toISOString(),
    })),
    ...payments.map((p) => ({
      type: "payment" as const,
      description:
        p.type === "donation"
          ? `Donated $${(p.amount / 100).toFixed(2)}`
          : `Paid $${(p.amount / 100).toFixed(2)} to join`,
      userId: p.userId,
      userName: p.userName,
      timestamp: p.createdAt.toISOString(),
    })),
    ...stories.map((s) => ({
      type: "story" as const,
      description: `Published story: ${s.title}`,
      userId: s.userId,
      userName: s.userName,
      timestamp: s.createdAt.toISOString(),
    })),
  ];

  // Sort by date descending and limit to 50
  activity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json(activity.slice(0, 50));
}
