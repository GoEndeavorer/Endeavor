import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { task, taskDependency } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";
import { alias } from "drizzle-orm/pg-core";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dependentTask = alias(task, "dependentTask");
  const dependsOnTask = alias(task, "dependsOnTask");

  const dependencies = await db
    .select({
      id: taskDependency.id,
      taskId: taskDependency.taskId,
      dependsOnId: taskDependency.dependsOnId,
      taskTitle: dependentTask.title,
      taskStatus: dependentTask.status,
      dependsOnTitle: dependsOnTask.title,
      dependsOnStatus: dependsOnTask.status,
      createdAt: taskDependency.createdAt,
    })
    .from(taskDependency)
    .innerJoin(dependentTask, eq(taskDependency.taskId, dependentTask.id))
    .innerJoin(dependsOnTask, eq(taskDependency.dependsOnId, dependsOnTask.id))
    .where(eq(dependentTask.endeavorId, id));

  return NextResponse.json(dependencies);
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

  const { taskId, dependsOnId } = await request.json();

  if (!taskId || !dependsOnId) {
    return NextResponse.json(
      { error: "taskId and dependsOnId are required" },
      { status: 400 }
    );
  }

  if (taskId === dependsOnId) {
    return NextResponse.json(
      { error: "A task cannot depend on itself" },
      { status: 400 }
    );
  }

  // Validate both tasks belong to this endeavor
  const tasks = await db
    .select({ id: task.id, endeavorId: task.endeavorId })
    .from(task)
    .where(eq(task.endeavorId, id));

  const taskIds = new Set(tasks.map((t) => t.id));

  if (!taskIds.has(taskId) || !taskIds.has(dependsOnId)) {
    return NextResponse.json(
      { error: "Both tasks must belong to this endeavor" },
      { status: 400 }
    );
  }

  // Check for duplicate
  const [existing] = await db
    .select()
    .from(taskDependency)
    .where(
      and(
        eq(taskDependency.taskId, taskId),
        eq(taskDependency.dependsOnId, dependsOnId)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "This dependency already exists" },
      { status: 409 }
    );
  }

  const [newDep] = await db
    .insert(taskDependency)
    .values({ taskId, dependsOnId })
    .returning();

  return NextResponse.json(newDep, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId, dependsOnId } = await request.json();

  if (!taskId || !dependsOnId) {
    return NextResponse.json(
      { error: "taskId and dependsOnId are required" },
      { status: 400 }
    );
  }

  // Verify the task belongs to this endeavor
  const [t] = await db
    .select({ id: task.id })
    .from(task)
    .where(and(eq(task.id, taskId), eq(task.endeavorId, id)))
    .limit(1);

  if (!t) {
    return NextResponse.json(
      { error: "Task not found in this endeavor" },
      { status: 404 }
    );
  }

  await db
    .delete(taskDependency)
    .where(
      and(
        eq(taskDependency.taskId, taskId),
        eq(taskDependency.dependsOnId, dependsOnId)
      )
    );

  return NextResponse.json({ success: true });
}
