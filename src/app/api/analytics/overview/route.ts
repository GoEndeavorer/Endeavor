import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, user, discussion, task, story } from "@/lib/db/schema";
import { count, eq, sql, gte, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    [totalUsers],
    [totalEndeavors],
    [totalDiscussions],
    [totalTasks],
    [totalStories],
    [newUsersWeek],
    [newEndeavorsWeek],
    [activeEndeavors],
    topCategories,
    dailyActivity,
  ] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(endeavor),
    db.select({ count: count() }).from(discussion),
    db.select({ count: count() }).from(task),
    db.select({ count: count() }).from(story).where(eq(story.published, true)),
    db.select({ count: count() }).from(user).where(gte(user.createdAt, sevenDaysAgo)),
    db.select({ count: count() }).from(endeavor).where(gte(endeavor.createdAt, sevenDaysAgo)),
    db
      .select({ count: count() })
      .from(endeavor)
      .where(or(eq(endeavor.status, "open"), eq(endeavor.status, "in-progress"))),
    db
      .select({
        category: endeavor.category,
        count: count(),
      })
      .from(endeavor)
      .groupBy(endeavor.category)
      .orderBy(sql`count(*) desc`)
      .limit(10),
    db.execute(sql`
      SELECT
        d::date AS day,
        COALESCE(e.cnt, 0) AS endeavors,
        COALESCE(u.cnt, 0) AS users,
        COALESCE(disc.cnt, 0) AS discussions,
        COALESCE(t.cnt, 0) AS tasks,
        COALESCE(s.cnt, 0) AS stories
      FROM generate_series(
        ${thirtyDaysAgo.toISOString()}::date,
        ${now.toISOString()}::date,
        '1 day'::interval
      ) AS d
      LEFT JOIN (
        SELECT created_at::date AS day, count(*) AS cnt
        FROM endeavor
        WHERE created_at >= ${thirtyDaysAgo.toISOString()}::timestamp
        GROUP BY created_at::date
      ) e ON e.day = d::date
      LEFT JOIN (
        SELECT created_at::date AS day, count(*) AS cnt
        FROM "user"
        WHERE created_at >= ${thirtyDaysAgo.toISOString()}::timestamp
        GROUP BY created_at::date
      ) u ON u.day = d::date
      LEFT JOIN (
        SELECT created_at::date AS day, count(*) AS cnt
        FROM discussion
        WHERE created_at >= ${thirtyDaysAgo.toISOString()}::timestamp
        GROUP BY created_at::date
      ) disc ON disc.day = d::date
      LEFT JOIN (
        SELECT created_at::date AS day, count(*) AS cnt
        FROM task
        WHERE created_at >= ${thirtyDaysAgo.toISOString()}::timestamp
        GROUP BY created_at::date
      ) t ON t.day = d::date
      LEFT JOIN (
        SELECT created_at::date AS day, count(*) AS cnt
        FROM story
        WHERE published = true AND created_at >= ${thirtyDaysAgo.toISOString()}::timestamp
        GROUP BY created_at::date
      ) s ON s.day = d::date
      ORDER BY d::date ASC
    `),
  ]);

  const dailyRows = (dailyActivity as { rows: Array<Record<string, unknown>> }).rows ?? dailyActivity;

  const daily = (Array.isArray(dailyRows) ? dailyRows : []).map((row: Record<string, unknown>) => ({
    day: String(row.day).slice(0, 10),
    endeavors: Number(row.endeavors) || 0,
    users: Number(row.users) || 0,
    discussions: Number(row.discussions) || 0,
    tasks: Number(row.tasks) || 0,
    stories: Number(row.stories) || 0,
  }));

  return NextResponse.json({
    totals: {
      users: totalUsers.count,
      endeavors: totalEndeavors.count,
      discussions: totalDiscussions.count,
      tasks: totalTasks.count,
      stories: totalStories.count,
      activeEndeavors: activeEndeavors.count,
    },
    growth: {
      newUsersWeek: newUsersWeek.count,
      newEndeavorsWeek: newEndeavorsWeek.count,
    },
    topCategories: topCategories.map((c) => ({
      category: c.category,
      count: c.count,
    })),
    daily,
  });
}
