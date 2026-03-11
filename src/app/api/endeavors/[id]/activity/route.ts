import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussion, task, milestone, story, member, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, sql } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

type ActivityItem = {
  id: string;
  type: "discussion" | "task" | "milestone" | "story" | "member";
  title: string;
  detail: string | null;
  actorName: string;
  createdAt: string;
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch recent items from each table in parallel
  const [discussions, tasks, milestones, stories, members] = await Promise.all([
    db
      .select({
        id: discussion.id,
        content: discussion.content,
        createdAt: discussion.createdAt,
        authorName: user.name,
      })
      .from(discussion)
      .innerJoin(user, eq(discussion.authorId, user.id))
      .where(eq(discussion.endeavorId, id))
      .orderBy(desc(discussion.createdAt))
      .limit(10),
    db
      .select({
        id: task.id,
        title: task.title,
        status: task.status,
        createdAt: task.createdAt,
        creatorName: user.name,
      })
      .from(task)
      .innerJoin(user, eq(task.createdById, user.id))
      .where(eq(task.endeavorId, id))
      .orderBy(desc(task.createdAt))
      .limit(10),
    db
      .select({
        id: milestone.id,
        title: milestone.title,
        completed: milestone.completed,
        completedAt: milestone.completedAt,
        createdAt: milestone.createdAt,
      })
      .from(milestone)
      .where(eq(milestone.endeavorId, id))
      .orderBy(desc(milestone.createdAt))
      .limit(10),
    db
      .select({
        id: story.id,
        title: story.title,
        published: story.published,
        createdAt: story.createdAt,
        authorName: user.name,
      })
      .from(story)
      .innerJoin(user, eq(story.authorId, user.id))
      .where(eq(story.endeavorId, id))
      .orderBy(desc(story.createdAt))
      .limit(5),
    db
      .select({
        id: member.id,
        joinedAt: member.joinedAt,
        role: member.role,
        userName: user.name,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(sql`${member.endeavorId} = ${id} AND ${member.status} = 'approved'`)
      .orderBy(desc(member.joinedAt))
      .limit(10),
  ]);

  // Merge into unified timeline
  const activity: ActivityItem[] = [
    ...discussions.map((d) => ({
      id: d.id,
      type: "discussion" as const,
      title: "Posted a message",
      detail: d.content.length > 100 ? d.content.slice(0, 100) + "..." : d.content,
      actorName: d.authorName,
      createdAt: d.createdAt.toISOString(),
    })),
    ...tasks.map((t) => ({
      id: t.id,
      type: "task" as const,
      title: `Created task: ${t.title}`,
      detail: t.status,
      actorName: t.creatorName,
      createdAt: t.createdAt.toISOString(),
    })),
    ...milestones.map((m) => ({
      id: m.id,
      type: "milestone" as const,
      title: m.completed ? `Completed milestone: ${m.title}` : `Added milestone: ${m.title}`,
      detail: m.completedAt ? `Completed ${m.completedAt.toISOString()}` : null,
      actorName: "",
      createdAt: m.createdAt.toISOString(),
    })),
    ...stories.map((s) => ({
      id: s.id,
      type: "story" as const,
      title: `${s.published ? "Published" : "Drafted"} story: ${s.title}`,
      detail: null,
      actorName: s.authorName,
      createdAt: s.createdAt.toISOString(),
    })),
    ...members.map((m) => ({
      id: m.id,
      type: "member" as const,
      title: m.role === "creator" ? "Created this endeavor" : "Joined the crew",
      detail: null,
      actorName: m.userName,
      createdAt: m.joinedAt.toISOString(),
    })),
  ];

  // Sort by date descending
  activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(activity.slice(0, 30));
}
