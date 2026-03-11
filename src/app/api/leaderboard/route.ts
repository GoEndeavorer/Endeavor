import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  user,
  endeavor,
  member,
  discussion,
  story,
  endorsement,
  task,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const TITLES: Record<number, string> = {
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

function getTitle(level: number): string {
  if (level >= 10) return TITLES[10];
  return TITLES[level] ?? TITLES[1];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "all";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "25", 10) || 25, 1), 100);

  // Build a date filter for month/week periods
  let dateFilter = sql`TRUE`;
  if (period === "month") {
    dateFilter = sql`created_at >= NOW() - INTERVAL '1 month'`;
  } else if (period === "week") {
    dateFilter = sql`created_at >= NOW() - INTERVAL '1 week'`;
  }

  // Date filter referencing specific table timestamps
  const endeavorDateFilter =
    period === "all"
      ? sql`TRUE`
      : period === "month"
        ? sql`${endeavor.createdAt} >= NOW() - INTERVAL '1 month'`
        : sql`${endeavor.createdAt} >= NOW() - INTERVAL '1 week'`;

  const memberDateFilter =
    period === "all"
      ? sql`TRUE`
      : period === "month"
        ? sql`${member.joinedAt} >= NOW() - INTERVAL '1 month'`
        : sql`${member.joinedAt} >= NOW() - INTERVAL '1 week'`;

  const discussionDateFilter =
    period === "all"
      ? sql`TRUE`
      : period === "month"
        ? sql`${discussion.createdAt} >= NOW() - INTERVAL '1 month'`
        : sql`${discussion.createdAt} >= NOW() - INTERVAL '1 week'`;

  const storyDateFilter =
    period === "all"
      ? sql`TRUE`
      : period === "month"
        ? sql`${story.createdAt} >= NOW() - INTERVAL '1 month'`
        : sql`${story.createdAt} >= NOW() - INTERVAL '1 week'`;

  const endorsementDateFilter =
    period === "all"
      ? sql`TRUE`
      : period === "month"
        ? sql`${endorsement.createdAt} >= NOW() - INTERVAL '1 month'`
        : sql`${endorsement.createdAt} >= NOW() - INTERVAL '1 week'`;

  const taskDateFilter =
    period === "all"
      ? sql`TRUE`
      : period === "month"
        ? sql`${task.createdAt} >= NOW() - INTERVAL '1 month'`
        : sql`${task.createdAt} >= NOW() - INTERVAL '1 week'`;

  const rows = await db
    .select({
      userId: user.id,
      name: user.name,
      image: user.image,
      endeavorsCreated: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${endeavor}
        WHERE ${endeavor.creatorId} = ${user.id}
        AND ${endeavorDateFilter}
      ), 0)::int`,
      endeavorsJoined: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${member}
        WHERE ${member.userId} = ${user.id}
        AND ${member.status} = 'approved'
        AND ${memberDateFilter}
      ), 0)::int`,
      discussions: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${discussion}
        WHERE ${discussion.authorId} = ${user.id}
        AND ${discussionDateFilter}
      ), 0)::int`,
      stories: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${story}
        WHERE ${story.authorId} = ${user.id}
        AND ${story.published} = true
        AND ${storyDateFilter}
      ), 0)::int`,
      endorsementsReceived: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${endorsement}
        WHERE ${endorsement.authorId} != ${user.id}
        AND ${endorsement.endeavorId} IN (
          SELECT ${endeavor.id} FROM ${endeavor} WHERE ${endeavor.creatorId} = ${user.id}
        )
        AND ${endorsementDateFilter}
      ), 0)::int`,
      tasksCompleted: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${task}
        WHERE ${task.assigneeId} = ${user.id}
        AND ${task.status} = 'done'
        AND ${taskDateFilter}
      ), 0)::int`,
    })
    .from(user)
    .orderBy(
      sql`(
        COALESCE((SELECT COUNT(*) FROM ${endeavor} WHERE ${endeavor.creatorId} = ${user.id} AND ${endeavorDateFilter}), 0) * 50 +
        COALESCE((SELECT COUNT(*) FROM ${member} WHERE ${member.userId} = ${user.id} AND ${member.status} = 'approved' AND ${memberDateFilter}), 0) * 20 +
        COALESCE((SELECT COUNT(*) FROM ${discussion} WHERE ${discussion.authorId} = ${user.id} AND ${discussionDateFilter}), 0) * 5 +
        COALESCE((SELECT COUNT(*) FROM ${story} WHERE ${story.authorId} = ${user.id} AND ${story.published} = true AND ${storyDateFilter}), 0) * 30 +
        COALESCE((SELECT COUNT(*) FROM ${endorsement} WHERE ${endorsement.authorId} != ${user.id} AND ${endorsement.endeavorId} IN (SELECT ${endeavor.id} FROM ${endeavor} WHERE ${endeavor.creatorId} = ${user.id}) AND ${endorsementDateFilter}), 0) * 15 +
        COALESCE((SELECT COUNT(*) FROM ${task} WHERE ${task.assigneeId} = ${user.id} AND ${task.status} = 'done' AND ${taskDateFilter}), 0) * 10
      ) DESC`
    )
    .limit(limit);

  const leaderboard = rows
    .map((row, index) => {
      const xp =
        row.endeavorsCreated * 50 +
        row.endeavorsJoined * 20 +
        row.discussions * 5 +
        row.stories * 30 +
        row.endorsementsReceived * 15 +
        row.tasksCompleted * 10;

      const level = Math.floor(Math.sqrt(xp / 50)) + 1;
      const title = getTitle(level);

      return {
        userId: row.userId,
        name: row.name,
        image: row.image,
        xp,
        level,
        title,
        rank: index + 1,
      };
    })
    .filter((entry) => entry.xp > 0);

  return NextResponse.json(leaderboard);
}
