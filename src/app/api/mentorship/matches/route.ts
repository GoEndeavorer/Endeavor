import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - find potential mentors based on shared skills/interests
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get current user's skills and interests
  const userResult = await db.execute(sql`
    SELECT skills, interests FROM "user" WHERE id = ${session.user.id}
  `);

  const user = userResult.rows[0] as { skills: string[] | null; interests: string[] | null };
  const userSkills = user?.skills || [];
  const userInterests = user?.interests || [];

  if (userSkills.length === 0 && userInterests.length === 0) {
    return NextResponse.json([]);
  }

  // Find users with overlapping skills who have more experience (higher XP)
  const result = await db.execute(sql`
    WITH user_xp AS (
      SELECT
        u.id,
        u.name,
        u.image,
        u.skills,
        u.bio,
        (
          (SELECT COUNT(*) FROM endeavor WHERE creator_id = u.id) * 50 +
          (SELECT COUNT(*) FROM member WHERE user_id = u.id AND status = 'approved') * 20 +
          (SELECT COUNT(*) FROM discussion WHERE author_id = u.id) * 5 +
          (SELECT COUNT(*) FROM story WHERE author_id = u.id AND published = true) * 30 +
          (SELECT COUNT(*) FROM endorsement WHERE to_user_id = u.id) * 15 +
          (SELECT COUNT(*) FROM task WHERE assignee_id = u.id AND status = 'completed') * 10
        ) as xp
      FROM "user" u
      WHERE u.id != ${session.user.id}
    )
    SELECT
      ux.id as user_id,
      ux.name,
      ux.image,
      ux.skills,
      ux.bio,
      ux.xp,
      FLOOR(SQRT(ux.xp / 50.0)) + 1 as level
    FROM user_xp ux
    WHERE ux.xp > 50
      AND ux.skills IS NOT NULL
      AND array_length(ux.skills, 1) > 0
    ORDER BY ux.xp DESC
    LIMIT 20
  `);

  type MentorRow = {
    user_id: string;
    name: string;
    image: string | null;
    skills: string[] | null;
    bio: string | null;
    xp: number;
    level: number;
  };

  // Score matches based on skill overlap
  const matches = (result.rows as MentorRow[]).map((row) => {
    const mentorSkills = row.skills || [];
    const overlap = mentorSkills.filter((s) =>
      userSkills.some((us) => us.toLowerCase() === s.toLowerCase()) ||
      userInterests.some((ui) => ui.toLowerCase() === s.toLowerCase())
    );

    return {
      userId: row.user_id,
      name: row.name,
      image: row.image,
      bio: row.bio,
      xp: Number(row.xp),
      level: Number(row.level),
      skills: mentorSkills,
      matchingSkills: overlap,
      matchScore: overlap.length,
    };
  });

  // Sort by match score then XP
  matches.sort((a, b) => b.matchScore - a.matchScore || b.xp - a.xp);

  return NextResponse.json(matches.filter((m) => m.matchScore > 0).slice(0, 10));
}
