import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

// Remove a member (creator only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, memberId } = await params;

  // Verify caller is the endeavor creator
  const [end] = await db
    .select({ creatorId: endeavor.creatorId })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can remove members" }, { status: 403 });
  }

  // Verify the member exists and isn't the creator
  const [existing] = await db
    .select()
    .from(member)
    .where(and(eq(member.id, memberId), eq(member.endeavorId, id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (existing.role === "creator") {
    return NextResponse.json({ error: "Cannot remove the creator" }, { status: 400 });
  }

  await db.delete(member).where(eq(member.id, memberId));

  return NextResponse.json({ success: true });
}
