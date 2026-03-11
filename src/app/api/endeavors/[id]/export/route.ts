import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user, task, milestone, discussion, link, payment, story, update } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Only creator can export
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only creator can export" }, { status: 403 });
  }

  const [members, tasks, milestones, discussions, links, payments, stories, updates] = await Promise.all([
    db
      .select({ name: user.name, email: user.email, role: member.role, joinedAt: member.joinedAt })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.endeavorId, id)),
    db.select().from(task).where(eq(task.endeavorId, id)),
    db.select().from(milestone).where(eq(milestone.endeavorId, id)),
    db
      .select({ content: discussion.content, authorName: user.name, createdAt: discussion.createdAt })
      .from(discussion)
      .innerJoin(user, eq(discussion.authorId, user.id))
      .where(eq(discussion.endeavorId, id)),
    db.select().from(link).where(eq(link.endeavorId, id)),
    db
      .select({ type: payment.type, amount: payment.amount, status: payment.status, createdAt: payment.createdAt })
      .from(payment)
      .where(eq(payment.endeavorId, id)),
    db.select().from(story).where(eq(story.endeavorId, id)),
    db.select().from(update).where(eq(update.endeavorId, id)),
  ]);

  const exportData = {
    endeavor: {
      title: end.title,
      description: end.description,
      category: end.category,
      location: end.location,
      status: end.status,
      createdAt: end.createdAt,
    },
    members: members.map((m) => ({
      name: m.name,
      email: m.email,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    tasks: tasks.map((t) => ({
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
    })),
    milestones: milestones.map((m) => ({
      title: m.title,
      description: m.description,
      targetDate: m.targetDate,
      completed: m.completed,
      completedAt: m.completedAt,
    })),
    discussions: discussions.map((d) => ({
      author: d.authorName,
      content: d.content,
      createdAt: d.createdAt,
    })),
    links: links.map((l) => ({
      title: l.title,
      url: l.url,
      description: l.description,
    })),
    payments: payments.map((p) => ({
      type: p.type,
      amount: p.amount / 100,
      status: p.status,
      createdAt: p.createdAt,
    })),
    stories: stories.map((s) => ({
      title: s.title,
      content: s.content,
      published: s.published,
      createdAt: s.createdAt,
    })),
    updates: updates.map((u) => ({
      title: u.title,
      content: u.content,
      pinned: u.pinned,
      createdAt: u.createdAt,
    })),
    exportedAt: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${end.title.replace(/[^a-z0-9]/gi, "_")}_export.json"`,
    },
  });
}
