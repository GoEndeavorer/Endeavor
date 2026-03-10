import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  // Trending = most members joined recently, weighted by recency
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
    .where(eq(endeavor.status, "open"))
    .groupBy(endeavor.id)
    .orderBy(desc(sql`count(${member.id})`), desc(endeavor.createdAt))
    .limit(6);

  const enriched = results.map((r) => ({
    ...r.endeavor,
    memberCount: (r.memberCount || 0) + 1,
  }));

  return NextResponse.json(enriched);
}
