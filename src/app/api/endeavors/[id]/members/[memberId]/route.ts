import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member, endeavor, notification } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

// Remove a member (creator or self)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, memberId } = await params;

  const [existing] = await db
    .select()
    .from(member)
    .where(and(eq(member.id, memberId), eq(member.endeavorId, id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const [end] = await db
    .select({ creatorId: endeavor.creatorId, title: endeavor.title })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Endeavor not found" }, { status: 404 });
  }

  const isCreator = end.creatorId === session.user.id;
  const isSelf = existing.userId === session.user.id;

  if (!isCreator && !isSelf) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (existing.role === "creator" && !isSelf) {
    return NextResponse.json({ error: "Cannot remove the creator" }, { status: 400 });
  }

  await db.delete(member).where(eq(member.id, memberId));

  // Notify removed member (when removed by creator)
  if (isCreator && !isSelf) {
    await db.insert(notification).values({
      userId: existing.userId,
      type: "member_removed",
      message: `You were removed from "${end.title}"`,
      endeavorId: id,
    });
  }

  // Notify creator when member leaves
  if (isSelf && !isCreator) {
    await db.insert(notification).values({
      userId: end.creatorId,
      type: "member_left",
      message: `A member left "${end.title}"`,
      endeavorId: id,
    });
  }

  return NextResponse.json({ success: true });
}
