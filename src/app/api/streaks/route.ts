import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_streak (
      user_id TEXT PRIMARY KEY,
      current_streak INT NOT NULL DEFAULT 0,
      longest_streak INT NOT NULL DEFAULT 0,
      last_activity_date DATE,
      total_active_days INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT * FROM user_streak WHERE user_id = ${session.user.id}
  `);

  if (result.rows.length === 0) {
    return NextResponse.json({
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      total_active_days: 0,
    });
  }

  return NextResponse.json(result.rows[0]);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_streak (
      user_id TEXT PRIMARY KEY,
      current_streak INT NOT NULL DEFAULT 0,
      longest_streak INT NOT NULL DEFAULT 0,
      last_activity_date DATE,
      total_active_days INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Check existing streak
  const existing = await db.execute(sql`
    SELECT * FROM user_streak WHERE user_id = ${session.user.id}
  `);

  if (existing.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO user_streak (user_id, current_streak, longest_streak, last_activity_date, total_active_days)
      VALUES (${session.user.id}, 1, 1, CURRENT_DATE, 1)
    `);
  } else {
    const streak = existing.rows[0] as { last_activity_date: string; current_streak: number; longest_streak: number; total_active_days: number };
    const lastDate = streak.last_activity_date ? new Date(streak.last_activity_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);

      if (diffDays === 0) {
        // Already logged today
        return NextResponse.json(streak);
      } else if (diffDays === 1) {
        // Consecutive day
        const newStreak = streak.current_streak + 1;
        const newLongest = Math.max(newStreak, streak.longest_streak);
        await db.execute(sql`
          UPDATE user_streak SET
            current_streak = ${newStreak},
            longest_streak = ${newLongest},
            last_activity_date = CURRENT_DATE,
            total_active_days = total_active_days + 1,
            updated_at = NOW()
          WHERE user_id = ${session.user.id}
        `);
      } else {
        // Streak broken
        await db.execute(sql`
          UPDATE user_streak SET
            current_streak = 1,
            last_activity_date = CURRENT_DATE,
            total_active_days = total_active_days + 1,
            updated_at = NOW()
          WHERE user_id = ${session.user.id}
        `);
      }
    }
  }

  const updated = await db.execute(sql`SELECT * FROM user_streak WHERE user_id = ${session.user.id}`);
  return NextResponse.json(updated.rows[0]);
}
