import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, task, milestone, discussion, story, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch endeavor details
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Endeavor not found" }, { status: 404 });
  }

  // Only approved members can export
  const [membership] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, id),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json(
      { error: "Only approved members can export" },
      { status: 403 }
    );
  }

  // Fetch all sections in parallel
  const [members, tasks, milestones, discussions, stories] = await Promise.all([
    db
      .select({
        name: user.name,
        email: user.email,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.endeavorId, id))
      .orderBy(member.joinedAt),
    db
      .select()
      .from(task)
      .where(eq(task.endeavorId, id))
      .orderBy(desc(task.createdAt)),
    db
      .select()
      .from(milestone)
      .where(eq(milestone.endeavorId, id))
      .orderBy(milestone.createdAt),
    db
      .select({
        id: discussion.id,
        author: user.name,
        content: discussion.content,
        pinned: discussion.pinned,
        createdAt: discussion.createdAt,
      })
      .from(discussion)
      .innerJoin(user, eq(discussion.authorId, user.id))
      .where(eq(discussion.endeavorId, id))
      .orderBy(desc(discussion.createdAt)),
    db
      .select({
        id: story.id,
        title: story.title,
        content: story.content,
        author: user.name,
        published: story.published,
        createdAt: story.createdAt,
      })
      .from(story)
      .innerJoin(user, eq(story.authorId, user.id))
      .where(eq(story.endeavorId, id))
      .orderBy(desc(story.createdAt)),
  ]);

  const exportData = {
    endeavor: {
      title: end.title,
      description: end.description,
      category: end.category,
      location: end.location,
      locationType: end.locationType,
      status: end.status,
      needs: end.needs,
      capacity: end.capacity,
      costPerPerson: end.costPerPerson,
      fundingEnabled: end.fundingEnabled,
      fundingGoal: end.fundingGoal,
      fundingRaised: end.fundingRaised,
      joinType: end.joinType,
      imageUrl: end.imageUrl,
      createdAt: end.createdAt,
      updatedAt: end.updatedAt,
    },
    members: members.map((m) => ({
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
    })),
    tasks: tasks.map((t) => ({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    milestones: milestones.map((m) => ({
      title: m.title,
      description: m.description,
      targetDate: m.targetDate,
      completed: m.completed,
      completedAt: m.completedAt,
      createdAt: m.createdAt,
    })),
    discussions: discussions.map((d) => ({
      id: d.id,
      author: d.author,
      content: d.content,
      pinned: d.pinned,
      createdAt: d.createdAt,
    })),
    stories: stories.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      author: s.author,
      published: s.published,
      createdAt: s.createdAt,
    })),
    exportedAt: new Date().toISOString(),
  };

  const safeName = end.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="endeavor-${safeName}.json"`,
    },
  });
}
