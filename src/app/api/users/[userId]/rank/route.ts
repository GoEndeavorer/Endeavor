import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Calculate user's rank based on activity
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const result = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM endeavor WHERE creator_id = ${userId}) as endeavors_created,
      (SELECT COUNT(*) FROM member WHERE user_id = ${userId} AND status = 'approved') as endeavors_joined,
      (SELECT COUNT(*) FROM discussion WHERE author_id = ${userId}) as discussions,
      (SELECT COUNT(*) FROM story WHERE author_id = ${userId} AND published = true) as stories,
      (SELECT COUNT(*) FROM endorsement WHERE to_user_id = ${userId}) as endorsements_received,
      (SELECT COUNT(*) FROM task WHERE assignee_id = ${userId} AND status = 'completed') as tasks_completed
  `);

  const row = result.rows[0] as Record<string, number>;

  // Calculate XP
  const xp =
    Number(row.endeavors_created) * 50 +
    Number(row.endeavors_joined) * 20 +
    Number(row.discussions) * 5 +
    Number(row.stories) * 30 +
    Number(row.endorsements_received) * 15 +
    Number(row.tasks_completed) * 10;

  // Calculate level (exponential curve)
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const currentLevelXp = (level - 1) * (level - 1) * 50;
  const nextLevelXp = level * level * 50;
  const progressToNext = Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

  const titles: Record<number, string> = {
    1: "Newcomer",
    2: "Explorer",
    3: "Contributor",
    4: "Builder",
    5: "Organizer",
    6: "Leader",
    7: "Pioneer",
    8: "Visionary",
    9: "Legend",
    10: "Icon",
  };

  const title = titles[Math.min(level, 10)] || "Master";

  return NextResponse.json({
    xp,
    level,
    title,
    progressToNext,
    nextLevelXp,
    breakdown: {
      endeavorsCreated: Number(row.endeavors_created),
      endeavorsJoined: Number(row.endeavors_joined),
      discussions: Number(row.discussions),
      stories: Number(row.stories),
      endorsementsReceived: Number(row.endorsements_received),
      tasksCompleted: Number(row.tasks_completed),
    },
  });
}
