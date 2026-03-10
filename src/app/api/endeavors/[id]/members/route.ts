import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { notifyUser } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only creator can manage members
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId, action } = await request.json();
  if (!memberId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  const [updated] = await db
    .update(member)
    .set({ status: newStatus })
    .where(and(eq(member.id, memberId), eq(member.endeavorId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Notify the user
  await notifyUser(
    updated.userId,
    action === "approve" ? "member_joined" : "join_request",
    action === "approve"
      ? `You've been approved to join "${end.title}"!`
      : `Your request to join "${end.title}" was declined.`,
    id
  );

  return NextResponse.json(updated);
}
