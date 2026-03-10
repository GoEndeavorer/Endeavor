import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql, and, notInArray, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's skills and interests
  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const userSkills = currentUser?.skills || [];
  const userInterests = currentUser?.interests || [];
  const allTerms = [...userSkills, ...userInterests];

  // Get endeavors the user is already part of
  const myEndeavors = await db
    .select({ endeavorId: member.endeavorId })
    .from(member)
    .where(eq(member.userId, session.user.id));

  const myEndeavorIds = myEndeavors.map((m) => m.endeavorId);

  // Find open endeavors the user hasn't joined, preferring ones that match their skills
  const baseConditions = eq(endeavor.status, "open");
  const notJoined =
    myEndeavorIds.length > 0
      ? and(baseConditions, notInArray(endeavor.id, myEndeavorIds))
      : baseConditions;

  const results = await db
    .select({
      endeavor: endeavor,
      memberCount: sql<number>`count(${member.id})::int`,
    })
    .from(endeavor)
    .leftJoin(
      member,
      sql`${member.endeavorId} = ${endeavor.id} AND ${member.status} = 'approved'`
    )
    .where(notJoined!)
    .groupBy(endeavor.id)
    .orderBy(desc(endeavor.createdAt))
    .limit(20);

  // Score by skill/interest match
  const scored = results.map((r) => {
    let score = 0;
    const needs = r.endeavor.needs || [];

    for (const term of allTerms) {
      const lower = term.toLowerCase();
      if (needs.some((n) => n.toLowerCase().includes(lower))) score += 2;
      if (r.endeavor.category.toLowerCase().includes(lower)) score += 1;
      if (r.endeavor.description.toLowerCase().includes(lower)) score += 1;
    }

    return {
      ...r.endeavor,
      memberCount: (r.memberCount || 0) + 1,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json(scored);
}
