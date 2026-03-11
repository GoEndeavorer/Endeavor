import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { task, user, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";
import { notifyUser } from "@/lib/notifications";
import { sendTaskAssignmentEmail } from "@/lib/email";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await db
    .select({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      assigneeId: task.assigneeId,
      assigneeName: user.name,
      priority: task.priority,
    })
    .from(task)
    .leftJoin(user, eq(task.assigneeId, user.id))
    .where(eq(task.endeavorId, id));

  return NextResponse.json(tasks);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, assigneeId, dueDate, priority } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const [newTask] = await db
    .insert(task)
    .values({
      endeavorId: id,
      title: title.trim(),
      description: description?.trim() || null,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      createdById: session.user.id,
    })
    .returning();

  // Notify assigned user (in-app + email)
  if (assigneeId && assigneeId !== session.user.id) {
    await notifyUser(
      assigneeId,
      "task_assigned",
      `${session.user.name} assigned you a task: "${title.trim()}"`,
      id
    );

    // Send email notification
    const [[assignee], [end]] = await Promise.all([
      db.select({ email: user.email, name: user.name }).from(user).where(eq(user.id, assigneeId)).limit(1),
      db.select({ title: endeavor.title }).from(endeavor).where(eq(endeavor.id, id)).limit(1),
    ]);
    if (assignee && end) {
      sendTaskAssignmentEmail(
        assignee.email, assignee.name, session.user.name,
        title.trim(), end.title, id
      ).catch(() => {});
    }
  }

  return NextResponse.json(newTask, { status: 201 });
}
