import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, member, endeavor } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      interests: user.interests,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const memberships = await db
    .select({
      endeavorId: endeavor.id,
      endeavorTitle: endeavor.title,
      endeavorCategory: endeavor.category,
      endeavorStatus: endeavor.status,
      role: member.role,
    })
    .from(member)
    .innerJoin(endeavor, eq(member.endeavorId, endeavor.id))
    .where(and(eq(member.userId, userId), eq(member.status, "approved")));

  return NextResponse.json({ ...profile, endeavors: memberships });
}
