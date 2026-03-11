import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - detailed member directory for an endeavor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";

  const result = await db.execute(sql`
    SELECT
      u.id as user_id,
      u.name,
      u.image,
      u.bio,
      u.skills,
      u.location,
      m.role,
      m.joined_at,
      (SELECT COUNT(*) FROM discussion WHERE author_id = u.id AND endeavor_id = ${id}) as discussion_count,
      (SELECT COUNT(*) FROM task WHERE assignee_id = u.id AND endeavor_id = ${id} AND status = 'completed') as tasks_completed,
      (
        (SELECT COUNT(*) FROM endeavor WHERE creator_id = u.id) * 50 +
        (SELECT COUNT(*) FROM member WHERE user_id = u.id AND status = 'approved') * 20 +
        (SELECT COUNT(*) FROM discussion WHERE author_id = u.id) * 5 +
        (SELECT COUNT(*) FROM story WHERE author_id = u.id AND published = true) * 30 +
        (SELECT COUNT(*) FROM endorsement WHERE to_user_id = u.id) * 15 +
        (SELECT COUNT(*) FROM task WHERE assignee_id = u.id AND status = 'completed') * 10
      ) as xp
    FROM member m
    JOIN "user" u ON m.user_id = u.id
    WHERE m.endeavor_id = ${id}
      AND m.status = 'approved'
      ${search ? sql`AND (u.name ILIKE ${"%" + search + "%"} OR u.bio ILIKE ${"%" + search + "%"})` : sql``}
    ORDER BY
      CASE m.role
        WHEN 'creator' THEN 0
        WHEN 'admin' THEN 1
        WHEN 'moderator' THEN 2
        ELSE 3
      END,
      m.joined_at ASC
  `);

  const titles: Record<number, string> = {
    1: "Newcomer", 2: "Explorer", 3: "Contributor", 4: "Builder",
    5: "Organizer", 6: "Leader", 7: "Pioneer", 8: "Visionary",
    9: "Legend", 10: "Icon",
  };

  const members = result.rows.map((row) => {
    const r = row as {
      user_id: string; name: string; image: string | null; bio: string | null;
      skills: string[] | null; location: string | null; role: string;
      joined_at: string; discussion_count: number; tasks_completed: number; xp: number;
    };
    const xp = Number(r.xp);
    const level = Math.floor(Math.sqrt(xp / 50)) + 1;
    return {
      ...r,
      xp,
      level,
      title: titles[Math.min(level, 10)] || "Master",
      discussion_count: Number(r.discussion_count),
      tasks_completed: Number(r.tasks_completed),
    };
  });

  return NextResponse.json(members);
}
