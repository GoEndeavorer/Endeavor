import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type ActivityRow = {
  type: string;
  title: string;
  actor_name: string;
  actor_id: string;
  endeavor_id: string | null;
  endeavor_title: string | null;
  created_at: string;
};

// GET /api/feed/following — activity from followed users and watched endeavors
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Union query: recent activity from followed users + watched (bookmarked) endeavors
  const results = await db.execute(sql`
    (
      -- Endeavors created by followed users
      SELECT
        'new_endeavor' as type,
        e.title,
        u.name as actor_name,
        u.id as actor_id,
        e.id as endeavor_id,
        e.title as endeavor_title,
        e.created_at
      FROM endeavor e
      JOIN "user" u ON u.id = e.creator_id
      JOIN follow f ON f.following_id = e.creator_id AND f.follower_id = ${userId}
      ORDER BY e.created_at DESC
      LIMIT 15
    )
    UNION ALL
    (
      -- Discussions posted by followed users
      SELECT
        'discussion' as type,
        d.title,
        u.name as actor_name,
        u.id as actor_id,
        d.endeavor_id,
        e.title as endeavor_title,
        d.created_at
      FROM discussion d
      JOIN "user" u ON u.id = d.author_id
      JOIN endeavor e ON e.id = d.endeavor_id
      JOIN follow f ON f.following_id = d.author_id AND f.follower_id = ${userId}
      ORDER BY d.created_at DESC
      LIMIT 10
    )
    UNION ALL
    (
      -- Milestones on watched (bookmarked) endeavors
      SELECT
        'milestone' as type,
        m.title,
        u.name as actor_name,
        e.creator_id as actor_id,
        m.endeavor_id,
        e.title as endeavor_title,
        m.created_at
      FROM milestone m
      JOIN endeavor e ON e.id = m.endeavor_id
      JOIN "user" u ON u.id = e.creator_id
      JOIN bookmark b ON b.endeavor_id = m.endeavor_id AND b.user_id = ${userId}
      ORDER BY m.created_at DESC
      LIMIT 10
    )
    UNION ALL
    (
      -- Stories by followed users
      SELECT
        'story' as type,
        s.title,
        u.name as actor_name,
        u.id as actor_id,
        s.endeavor_id,
        e.title as endeavor_title,
        s.created_at
      FROM story s
      JOIN "user" u ON u.id = s.author_id
      JOIN endeavor e ON e.id = s.endeavor_id
      JOIN follow f ON f.following_id = s.author_id AND f.follower_id = ${userId}
      WHERE s.published = true
      ORDER BY s.created_at DESC
      LIMIT 10
    )
    UNION ALL
    (
      -- New members joining watched endeavors
      SELECT
        'member_joined' as type,
        u.name as title,
        u.name as actor_name,
        u.id as actor_id,
        mb.endeavor_id,
        e.title as endeavor_title,
        mb.joined_at as created_at
      FROM member mb
      JOIN "user" u ON u.id = mb.user_id
      JOIN endeavor e ON e.id = mb.endeavor_id
      JOIN bookmark bk ON bk.endeavor_id = mb.endeavor_id AND bk.user_id = ${userId}
      WHERE mb.status = 'approved'
        AND mb.user_id != ${userId}
      ORDER BY mb.joined_at DESC
      LIMIT 10
    )
    ORDER BY created_at DESC
    LIMIT 40
  `);

  const items = (results.rows as unknown as ActivityRow[]).map((row) => ({
    type: row.type,
    title: row.title,
    actorName: row.actor_name,
    actorId: row.actor_id,
    endeavorId: row.endeavor_id,
    endeavorTitle: row.endeavor_title,
    createdAt: row.created_at,
  }));

  return NextResponse.json(items);
}
