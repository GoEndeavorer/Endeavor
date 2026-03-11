import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { task, milestone, member, endeavor } from "@/lib/db/schema";
import { eq, and, isNotNull, gte, lte } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — calendar events for the logged-in user
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const startStr = url.searchParams.get("start");
  const endStr = url.searchParams.get("end");

  const start = startStr ? new Date(startStr) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endStr ? new Date(endStr) : new Date(new Date().setDate(new Date().getDate() + 90));

  // Get user's endeavor IDs
  const memberships = await db
    .select({ endeavorId: member.endeavorId })
    .from(member)
    .where(
      and(eq(member.userId, session.user.id), eq(member.status, "approved"))
    );

  const endeavorIds = memberships.map((m) => m.endeavorId);

  if (endeavorIds.length === 0) {
    return NextResponse.json([]);
  }

  // Get tasks with due dates
  const tasks = await db
    .select({
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      endeavorId: task.endeavorId,
      endeavorTitle: endeavor.title,
    })
    .from(task)
    .innerJoin(endeavor, eq(task.endeavorId, endeavor.id))
    .where(
      and(
        isNotNull(task.dueDate),
        gte(task.dueDate, start),
        lte(task.dueDate, end)
      )
    );

  // Get milestones with target dates
  const milestones = await db
    .select({
      id: milestone.id,
      title: milestone.title,
      completed: milestone.completed,
      targetDate: milestone.targetDate,
      endeavorId: milestone.endeavorId,
      endeavorTitle: endeavor.title,
    })
    .from(milestone)
    .innerJoin(endeavor, eq(milestone.endeavorId, endeavor.id))
    .where(
      and(
        isNotNull(milestone.targetDate),
        gte(milestone.targetDate, start),
        lte(milestone.targetDate, end)
      )
    );

  // Filter to user's endeavors and format
  const events = [
    ...tasks
      .filter((t) => endeavorIds.includes(t.endeavorId))
      .map((t) => ({
        id: t.id,
        type: "task" as const,
        title: t.title,
        date: t.dueDate!.toISOString(),
        status: t.status,
        endeavorId: t.endeavorId,
        endeavorTitle: t.endeavorTitle,
      })),
    ...milestones
      .filter((m) => endeavorIds.includes(m.endeavorId))
      .map((m) => ({
        id: m.id,
        type: "milestone" as const,
        title: m.title,
        date: m.targetDate!.toISOString(),
        status: m.completed ? "done" : "pending",
        endeavorId: m.endeavorId,
        endeavorTitle: m.endeavorTitle,
      })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json(events);
}
