import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Count distinct active days (any discussion, task update, or story)
  // Group by date going back 90 days
  const result = await db.execute(sql`
    WITH active_days AS (
      SELECT DISTINCT DATE(created_at) AS day FROM discussion
        WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '90 days'
      UNION
      SELECT DISTINCT DATE(created_at) AS day FROM task
        WHERE assignee_id = ${userId} AND created_at > NOW() - INTERVAL '90 days'
      UNION
      SELECT DISTINCT DATE(created_at) AS day FROM story
        WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '90 days'
      UNION
      SELECT DISTINCT DATE(created_at) AS day FROM member
        WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '90 days'
    ),
    ordered_days AS (
      SELECT day, ROW_NUMBER() OVER (ORDER BY day DESC) AS rn
      FROM active_days
      ORDER BY day DESC
    )
    SELECT day FROM ordered_days ORDER BY day DESC
  `);

  const days = result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return new Date(row.day as string).toISOString().split("T")[0];
  });

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const todayActive = days.includes(today);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = todayActive ? today : yesterday;

  for (let i = 0; i < days.length; i++) {
    if (days.includes(checkDate)) {
      currentStreak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDays = [...days].sort();

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return NextResponse.json({
    currentStreak,
    longestStreak,
    todayActive,
  });
}
