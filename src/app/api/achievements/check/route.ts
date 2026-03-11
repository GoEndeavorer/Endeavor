import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type AchievementRow = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: { type: string; threshold: number };
  xp_reward: number;
};

type CountRow = { count: string | number };

// POST: check and award achievements for the current user
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const newlyEarned: { id: string; name: string; icon: string; xp_reward: number }[] = [];

  // Ensure tables exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS achievement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '*',
      category TEXT NOT NULL DEFAULT 'milestone',
      criteria JSONB NOT NULL DEFAULT '{}',
      xp_reward INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_achievement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      achievement_id UUID NOT NULL REFERENCES achievement(id),
      earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, achievement_id)
    )
  `);

  // Get all achievement definitions
  const allResult = await db.execute(
    sql`SELECT * FROM achievement`
  );
  const allAchievements = allResult.rows as AchievementRow[];

  // Get user's already-earned achievements
  const earnedResult = await db.execute(
    sql`SELECT achievement_id FROM user_achievement WHERE user_id = ${userId}`
  );
  const earnedIds = new Set(
    (earnedResult.rows as { achievement_id: string }[]).map((r) => r.achievement_id)
  );

  // Gather user stats for criteria checking
  const stats: Record<string, number> = {};

  // Endeavors created
  const createdResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endeavor WHERE creator_id = ${userId}`
  );
  stats.endeavors_created = Number((createdResult.rows[0] as CountRow)?.count || 0);

  // Endeavors joined
  const joinedResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM member WHERE user_id = ${userId} AND status = 'approved' AND role = 'collaborator'`
  );
  stats.endeavors_joined = Number((joinedResult.rows[0] as CountRow)?.count || 0);

  // Tasks completed
  const tasksResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM task WHERE assignee_id = ${userId} AND status = 'done'`
  );
  stats.tasks_completed = Number((tasksResult.rows[0] as CountRow)?.count || 0);

  // Discussions posted
  const postsResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM discussion WHERE author_id = ${userId}`
  );
  stats.discussions_posted = Number((postsResult.rows[0] as CountRow)?.count || 0);

  // Stories published
  const storiesResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM story WHERE author_id = ${userId} AND published = true`
  );
  stats.stories_published = Number((storiesResult.rows[0] as CountRow)?.count || 0);

  // Endorsements given
  const endorseGivenResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endorsement WHERE user_id = ${userId}`
  );
  stats.endorsements_given = Number((endorseGivenResult.rows[0] as CountRow)?.count || 0);

  // Endorsements received
  const endorseReceivedResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endorsement e JOIN endeavor en ON e.endeavor_id = en.id WHERE en.creator_id = ${userId}`
  );
  stats.endorsements_received = Number((endorseReceivedResult.rows[0] as CountRow)?.count || 0);

  // Endeavors completed (as creator)
  const completedResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM endeavor WHERE creator_id = ${userId} AND status = 'completed'`
  );
  stats.endeavors_completed = Number((completedResult.rows[0] as CountRow)?.count || 0);

  // Milestones completed
  const milestoneResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM milestone m JOIN endeavor e ON m.endeavor_id = e.id WHERE e.creator_id = ${userId} AND m.completed = true`
  );
  stats.milestones_completed = Number((milestoneResult.rows[0] as CountRow)?.count || 0);

  // Activity streak (days with at least one activity in the last 30 days)
  const streakResult = await db.execute(
    sql`SELECT COUNT(DISTINCT DATE(created_at)) as count FROM activity_log WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '30 days'`
  );
  stats.streak_days = Number((streakResult.rows[0] as CountRow)?.count || 0);

  // Profile complete
  const user = session.user;
  stats.profile_complete = user.name && user.image ? 1 : 0;

  // Check each achievement against user stats
  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    const { type, threshold } = achievement.criteria;
    if (!type || threshold === undefined) continue;

    const currentValue = stats[type] ?? 0;

    if (currentValue >= threshold) {
      // Award the achievement
      try {
        await db.execute(sql`
          INSERT INTO user_achievement (user_id, achievement_id)
          VALUES (${userId}, ${achievement.id})
          ON CONFLICT (user_id, achievement_id) DO NOTHING
        `);
        earnedIds.add(achievement.id);
        newlyEarned.push({
          id: achievement.id,
          name: achievement.name,
          icon: achievement.icon,
          xp_reward: achievement.xp_reward,
        });
      } catch {
        // Unique constraint violation means already earned - skip
      }
    }
  }

  // Calculate total XP
  const xpResult = await db.execute(sql`
    SELECT COALESCE(SUM(a.xp_reward), 0) as total_xp
    FROM user_achievement ua
    JOIN achievement a ON ua.achievement_id = a.id
    WHERE ua.user_id = ${userId}
  `);
  const totalXp = Number((xpResult.rows[0] as { total_xp: string | number })?.total_xp || 0);

  return NextResponse.json({
    newlyEarned,
    totalEarned: earnedIds.size,
    totalAvailable: allAchievements.length,
    totalXp,
    stats,
  });
}
