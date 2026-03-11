import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { follow, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/follow/list?userId=xxx&type=followers|following
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const type = request.nextUrl.searchParams.get("type") || "followers";

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (type === "following") {
    const results = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        bio: user.bio,
      })
      .from(follow)
      .innerJoin(user, eq(follow.followingId, user.id))
      .where(eq(follow.followerId, userId));

    return NextResponse.json(results);
  }

  // Default: followers
  const results = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
    })
    .from(follow)
    .innerJoin(user, eq(follow.followerId, user.id))
    .where(eq(follow.followingId, userId));

  return NextResponse.json(results);
}
