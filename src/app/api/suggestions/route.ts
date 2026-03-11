import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — personalized suggestions based on user interests, skills, and location
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json([]);
  }

  // Get user profile
  const [profile] = await db
    .select({ interests: user.interests, skills: user.skills, location: user.location })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!profile || (!profile.interests?.length && !profile.skills?.length)) {
    return NextResponse.json([]);
  }

  // Get endeavors the user is NOT already a member of
  const memberEndeavors = await db
    .select({ endeavorId: member.endeavorId })
    .from(member)
    .where(eq(member.userId, session.user.id));

  const memberIds = memberEndeavors.map((m) => m.endeavorId);

  // Build interest + skill matching
  const allInterests = [...(profile.interests || []), ...(profile.skills || [])];

  if (allInterests.length === 0) {
    return NextResponse.json([]);
  }

  const suggestions = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.description,
      e.category,
      e.status,
      e.image_url,
      e.location,
      e.location_type,
      e.needs,
      (SELECT COUNT(*)::int FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') as member_count,
      COALESCE(array_length(ARRAY(
        SELECT unnest(e.needs) INTERSECT SELECT unnest(${allInterests}::text[])
      ), 1), 0) +
      CASE WHEN e.category = ANY(${allInterests}::text[]) THEN 2 ELSE 0 END +
      CASE WHEN e.location IS NOT NULL AND ${profile.location || ''} != '' AND e.location ILIKE '%' || ${profile.location || ''} || '%' THEN 1 ELSE 0 END
      as match_score
    FROM endeavor e
    WHERE e.status IN ('open', 'in-progress')
    ${memberIds.length > 0 ? sql`AND e.id NOT IN (${sql.join(memberIds.map(id => sql`${id}`), sql`, `)})` : sql``}
    ORDER BY match_score DESC, e.created_at DESC
    LIMIT 10
  `);

  // Filter out zero-score results
  const filtered = (suggestions.rows as Array<{ match_score: number } & Record<string, unknown>>)
    .filter((r) => Number(r.match_score) > 0);

  return NextResponse.json(filtered);
}
