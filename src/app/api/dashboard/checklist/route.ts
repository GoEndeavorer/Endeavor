import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [profile, endeavors, memberships, discussions, following] = await Promise.all([
    db.execute(sql`
      SELECT bio, skills, image FROM "user" WHERE id = ${userId} LIMIT 1
    `),
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM endeavor WHERE creator_id = ${userId}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM member WHERE user_id = ${userId} AND status = 'approved'
    `),
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM discussion WHERE author_id = ${userId}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int as count FROM follow WHERE follower_id = ${userId}
    `),
  ]);

  const user = profile.rows[0] as { bio: string | null; skills: string[] | null; image: string | null } | undefined;

  return NextResponse.json({
    hasProfile: !!(user?.image),
    hasSkills: !!(user?.skills && user.skills.length > 0),
    hasBio: !!(user?.bio && user.bio.trim().length > 0),
    hasEndeavor: Number((endeavors.rows[0] as { count: number })?.count) > 0,
    hasJoined: Number((memberships.rows[0] as { count: number })?.count) > 0,
    hasDiscussion: Number((discussions.rows[0] as { count: number })?.count) > 0,
    hasFollowed: Number((following.rows[0] as { count: number })?.count) > 0,
  });
}
