import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user, follow } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — personalized feed combining followed users' endeavors, interest matches, and trending
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json([]);
  }

  const userId = session.user.id;

  // Get user profile for interests
  const [profile] = await db
    .select({ interests: user.interests, skills: user.skills })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  // Get followed users
  const follows = await db
    .select({ followingId: follow.followingId })
    .from(follow)
    .where(eq(follow.followerId, userId));

  const followedIds = follows.map((f) => f.followingId);

  // Get already-joined endeavors to exclude
  const myEndeavors = await db
    .select({ endeavorId: member.endeavorId })
    .from(member)
    .where(eq(member.userId, userId));

  const myIds = myEndeavors.map((m) => m.endeavorId);

  const allInterests = [...(profile?.interests || []), ...(profile?.skills || [])];

  // Combined query: followed creators + interest matching + trending
  const results = await db.execute(sql`
    SELECT DISTINCT ON (e.id)
      e.id,
      e.title,
      e.description,
      e.category,
      e.status,
      e.image_url,
      e.location,
      e.location_type,
      e.needs,
      e.created_at,
      e.funding_enabled,
      e.funding_goal,
      e.funding_raised,
      e.cost_per_person,
      e.capacity,
      (SELECT COUNT(*)::int FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') as member_count,
      CASE WHEN e.creator_id = ANY(${followedIds.length > 0 ? followedIds : ['']}::text[]) THEN 5 ELSE 0 END +
      CASE WHEN ${allInterests.length > 0 ? sql`COALESCE(array_length(ARRAY(
        SELECT unnest(e.needs) INTERSECT SELECT unnest(${allInterests}::text[])
      ), 1), 0)` : sql`0`} END +
      CASE WHEN e.category = ANY(${allInterests.length > 0 ? allInterests : ['']}::text[]) THEN 3 ELSE 0 END
      as relevance
    FROM endeavor e
    WHERE e.status IN ('open', 'in-progress')
    ${myIds.length > 0 ? sql`AND e.id NOT IN (${sql.join(myIds.map(id => sql`${id}`), sql`, `)})` : sql``}
    ORDER BY e.id, relevance DESC
    LIMIT 20
  `);

  // Sort by relevance after distinct
  const sorted = (results.rows as Array<Record<string, unknown> & { relevance: number }>)
    .sort((a, b) => Number(b.relevance) - Number(a.relevance));

  return NextResponse.json(sorted);
}
