import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userAchievement, member, endeavor, task, discussion, story, endorsement } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";
import { ACHIEVEMENTS } from "@/lib/achievements";

export const dynamic = "force-dynamic";

// GET: get current user's achievements
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const session = await auth.api.getSession({ headers: await headers() });

  const targetUserId = userId || session?.user?.id;
  if (!targetUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unlocked = await db
    .select({ achievementKey: userAchievement.achievementKey, unlockedAt: userAchievement.unlockedAt })
    .from(userAchievement)
    .where(eq(userAchievement.userId, targetUserId));

  return NextResponse.json({
    unlocked: unlocked.map((u) => ({
      key: u.achievementKey,
      unlockedAt: u.unlockedAt,
    })),
    total: ACHIEVEMENTS.length,
  });
}

// POST: check and award achievements for current user
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const newlyUnlocked: string[] = [];

  // Get existing achievements
  const existing = await db
    .select({ key: userAchievement.achievementKey })
    .from(userAchievement)
    .where(eq(userAchievement.userId, userId));

  const existingKeys = new Set(existing.map((e) => e.key));

  async function award(key: string) {
    if (existingKeys.has(key)) return;
    await db.insert(userAchievement).values({ userId, achievementKey: key });
    newlyUnlocked.push(key);
    existingKeys.add(key);
  }

  // Count endeavors created
  const createdResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endeavor WHERE creator_id = ${userId}`
  );
  const created = Number(createdResult.rows[0]?.count || 0);
  if (created >= 1) await award("first_endeavor");
  if (created >= 5) await award("five_endeavors");
  if (created >= 10) await award("ten_endeavors");

  // Count joined
  const joinedResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM member WHERE user_id = ${userId} AND status = 'approved' AND role = 'collaborator'`
  );
  const joined = Number(joinedResult.rows[0]?.count || 0);
  if (joined >= 1) await award("first_join");
  if (joined >= 5) await award("five_joins");
  if (joined >= 10) await award("ten_joins");

  // Count tasks completed
  const tasksResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM task WHERE assignee_id = ${userId} AND status = 'done'`
  );
  const tasksDone = Number(tasksResult.rows[0]?.count || 0);
  if (tasksDone >= 1) await award("first_task");
  if (tasksDone >= 10) await award("ten_tasks");
  if (tasksDone >= 50) await award("fifty_tasks");
  if (tasksDone >= 100) await award("hundred_tasks");

  // Count discussions
  const postsResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM discussion WHERE author_id = ${userId}`
  );
  const posts = Number(postsResult.rows[0]?.count || 0);
  if (posts >= 1) await award("first_post");
  if (posts >= 50) await award("fifty_posts");
  if (posts >= 100) await award("hundred_posts");

  // Count stories
  const storiesResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM story WHERE author_id = ${userId} AND published = true`
  );
  const storiesCount = Number(storiesResult.rows[0]?.count || 0);
  if (storiesCount >= 1) await award("first_story");
  if (storiesCount >= 5) await award("five_stories");

  // Endorsements given
  const endorseGivenResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endorsement WHERE user_id = ${userId}`
  );
  if (Number(endorseGivenResult.rows[0]?.count || 0) >= 1) await award("first_endorsement");

  // Endorsements received
  const endorseReceivedResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endorsement e JOIN endeavor en ON e.endeavor_id = en.id WHERE en.creator_id = ${userId}`
  );
  if (Number(endorseReceivedResult.rows[0]?.count || 0) >= 10) await award("ten_endorsements_received");

  // Completed endeavor
  const completedResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endeavor WHERE creator_id = ${userId} AND status = 'completed'`
  );
  if (Number(completedResult.rows[0]?.count || 0) >= 1) await award("completed_endeavor");

  // Milestones completed
  const milestoneResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM milestone m JOIN endeavor e ON m.endeavor_id = e.id WHERE e.creator_id = ${userId} AND m.completed = true`
  );
  if (Number(milestoneResult.rows[0]?.count || 0) >= 1) await award("first_milestone");

  // Profile complete check
  const user = session.user;
  if (user.name && user.image) await award("profile_complete");

  return NextResponse.json({ newlyUnlocked, total: existingKeys.size });
}
