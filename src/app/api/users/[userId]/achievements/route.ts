import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type EarnedAchievementRow = {
  id: string;
  achievement_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  earned_at: string;
};

// GET: achievements earned by a specific user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

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

  // Get user's earned achievements with full details
  const result = await db.execute(sql`
    SELECT
      ua.id,
      ua.achievement_id,
      a.name,
      a.description,
      a.icon,
      a.category,
      a.xp_reward,
      ua.earned_at
    FROM user_achievement ua
    JOIN achievement a ON ua.achievement_id = a.id
    WHERE ua.user_id = ${userId}
    ORDER BY ua.earned_at DESC
  `);

  const achievements = result.rows as EarnedAchievementRow[];

  // Calculate total XP
  const totalXp = achievements.reduce((sum, a) => sum + (a.xp_reward || 0), 0);

  // Group by category
  const byCategory: Record<string, EarnedAchievementRow[]> = {};
  for (const a of achievements) {
    if (!byCategory[a.category]) byCategory[a.category] = [];
    byCategory[a.category].push(a);
  }

  return NextResponse.json({
    achievements,
    byCategory,
    totalEarned: achievements.length,
    totalXp,
  });
}
