import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user, notification, follow } from "@/lib/db/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Weekly digest data for a specific user
// Called by a cron job or manually to generate digest emails
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Only allow cron or admin access
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all users who have been active or have notifications
  const activeUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .limit(1000);

  const digests = [];

  for (const u of activeUsers) {
    // Count unread notifications
    const [unreadNotifs] = await db
      .select({ count: count() })
      .from(notification)
      .where(
        and(
          eq(notification.userId, u.id),
          eq(notification.read, false),
          gte(notification.createdAt, sevenDaysAgo)
        )
      );

    // New endeavors in categories the user is involved in
    const userCategories = await db
      .select({ category: endeavor.category })
      .from(member)
      .innerJoin(endeavor, eq(member.endeavorId, endeavor.id))
      .where(eq(member.userId, u.id))
      .limit(10);

    const categories = [...new Set(userCategories.map((c) => c.category))];

    // New endeavors from followed users
    const followedEndeavors = await db
      .select({
        id: endeavor.id,
        title: endeavor.title,
        category: endeavor.category,
      })
      .from(follow)
      .innerJoin(endeavor, eq(follow.followingId, endeavor.creatorId))
      .where(
        and(
          eq(follow.followerId, u.id),
          gte(endeavor.createdAt, sevenDaysAgo)
        )
      )
      .limit(5);

    if (unreadNotifs.count > 0 || followedEndeavors.length > 0) {
      digests.push({
        user: { id: u.id, name: u.name, email: u.email },
        unreadNotifications: unreadNotifs.count,
        newFromFollowed: followedEndeavors,
        activeCategories: categories,
      });
    }
  }

  return NextResponse.json({
    generated: new Date().toISOString(),
    period: "7 days",
    digests: digests.length,
    data: digests,
  });
}
