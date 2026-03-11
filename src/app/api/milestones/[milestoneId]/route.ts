import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { milestone } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";
import { notifyEndeavorMembers } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  const { milestoneId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(milestone)
    .where(eq(milestone.id, milestoneId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isMemberOf(existing.endeavorId, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.targetDate !== undefined)
    updates.targetDate = body.targetDate ? new Date(body.targetDate) : null;
  if (body.completed !== undefined) {
    updates.completed = body.completed;
    updates.completedAt = body.completed ? new Date() : null;
  }

  const [updated] = await db
    .update(milestone)
    .set(updates)
    .where(eq(milestone.id, milestoneId))
    .returning();

  // Notify team when milestone is completed
  if (body.completed === true) {
    await notifyEndeavorMembers(
      existing.endeavorId,
      "milestone_completed",
      `Milestone completed: "${existing.title}"`,
      session.user.id,
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  const { milestoneId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(milestone)
    .where(eq(milestone.id, milestoneId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isMemberOf(existing.endeavorId, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(milestone).where(eq(milestone.id, milestoneId));
  return NextResponse.json({ success: true });
}
