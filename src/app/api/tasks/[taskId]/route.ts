import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { task, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";
import { notifyUser } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(task)
    .where(eq(task.id, taskId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (!(await isMemberOf(existing.endeavorId, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status) updates.status = body.status;
  if (body.title) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.assigneeId !== undefined) updates.assigneeId = body.assigneeId;
  if (body.dueDate !== undefined)
    updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;

  const [updated] = await db
    .update(task)
    .set(updates)
    .where(eq(task.id, taskId))
    .returning();

  // Notify newly assigned user
  if (
    body.assigneeId &&
    body.assigneeId !== existing.assigneeId &&
    body.assigneeId !== session.user.id
  ) {
    await notifyUser(
      body.assigneeId,
      "task_assigned",
      `${session.user.name} assigned you a task: "${existing.title}"`,
      existing.endeavorId
    );
  }

  // Resolve assignee name for client
  let assigneeName: string | null = null;
  if (updated.assigneeId) {
    const [assignee] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, updated.assigneeId))
      .limit(1);
    assigneeName = assignee?.name || null;
  }

  return NextResponse.json({ ...updated, assigneeName });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(task)
    .where(eq(task.id, taskId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (!(await isMemberOf(existing.endeavorId, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(task).where(eq(task.id, taskId));
  return NextResponse.json({ success: true });
}
