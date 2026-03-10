import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
