import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { follow, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

// GET /api/follow?userId=xxx — check if following & get counts
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const [followers] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(follow)
    .where(eq(follow.followingId, userId));

  const [following] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(follow)
    .where(eq(follow.followerId, userId));

  let isFollowing = false;
  if (session) {
    const existing = await db
      .select({ id: follow.id })
      .from(follow)
      .where(
        and(
          eq(follow.followerId, session.user.id),
          eq(follow.followingId, userId)
        )
      )
      .limit(1);
    isFollowing = existing.length > 0;
  }

  return NextResponse.json({
    followers: followers.count,
    following: following.count,
    isFollowing,
  });
}

// POST /api/follow — toggle follow
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Check if already following
  const existing = await db
    .select({ id: follow.id })
    .from(follow)
    .where(
      and(
        eq(follow.followerId, session.user.id),
        eq(follow.followingId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(follow).where(eq(follow.id, existing[0].id));
    return NextResponse.json({ following: false });
  }

  await db.insert(follow).values({
    followerId: session.user.id,
    followingId: userId,
  });

  return NextResponse.json({ following: true });
}
