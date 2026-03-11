import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user, discussion, task, milestone, story, link, notification, payment } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { notifyEndeavorMembers } from "@/lib/notifications";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [result] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get members with user info
  const members = await db
    .select({
      id: member.id,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.endeavorId, id));

  // Get creator info
  const [creator] = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(eq(user.id, result.creatorId))
    .limit(1);

  const approvedCount = members.filter((m) => m.status === "approved").length;

  return NextResponse.json({
    ...result,
    creator,
    members: members.filter((m) => m.status === "approved"),
    pendingMembers: members.filter((m) => m.status === "pending"),
    memberCount: approvedCount,
  });
}

// Creator only: update endeavor details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can edit" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.category) updates.category = body.category;
  if (body.location !== undefined) updates.location = body.location;
  if (body.locationType) updates.locationType = body.locationType;
  if (body.needs !== undefined) updates.needs = body.needs;
  if (body.status) updates.status = body.status;
  if (body.costPerPerson !== undefined) updates.costPerPerson = body.costPerPerson;
  if (body.capacity !== undefined) updates.capacity = body.capacity;
  if (body.fundingEnabled !== undefined) updates.fundingEnabled = body.fundingEnabled;
  if (body.fundingGoal !== undefined) updates.fundingGoal = body.fundingGoal;
  if (body.joinType) updates.joinType = body.joinType;
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(endeavor)
    .set(updates)
    .where(eq(endeavor.id, id))
    .returning();

  // Notify members of status changes
  if (body.status && body.status !== existing.status) {
    const statusLabels: Record<string, string> = {
      "in-progress": "is now in progress",
      completed: "has been completed",
      cancelled: "has been cancelled",
      open: "is now open for new members",
    };
    const label = statusLabels[body.status];
    if (label) {
      await notifyEndeavorMembers(
        id,
        session.user.id,
        "status_change",
        `"${existing.title}" ${label}`,
      );
    }
  }

  return NextResponse.json(updated);
}

// Creator only: delete endeavor and all related data
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can delete" }, { status: 403 });
  }

  // Delete all related data (order matters for FK constraints)
  await db.delete(notification).where(eq(notification.endeavorId, id));
  await db.delete(payment).where(eq(payment.endeavorId, id));
  await db.delete(story).where(eq(story.endeavorId, id));
  await db.delete(milestone).where(eq(milestone.endeavorId, id));
  await db.delete(link).where(eq(link.endeavorId, id));
  await db.delete(task).where(eq(task.endeavorId, id));
  await db.delete(discussion).where(eq(discussion.endeavorId, id));
  await db.delete(member).where(eq(member.endeavorId, id));
  await db.delete(endeavor).where(eq(endeavor.id, id));

  return NextResponse.json({ success: true });
}
