import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { eq, or, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/endeavors/hiring — endeavors with needs that are actively seeking people
export async function GET() {
  const results = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      description: endeavor.description,
      category: endeavor.category,
      location: endeavor.location,
      locationType: endeavor.locationType,
      needs: endeavor.needs,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
      capacity: endeavor.capacity,
      joinType: endeavor.joinType,
      creatorId: endeavor.creatorId,
      creatorName: user.name,
      createdAt: endeavor.createdAt,
      memberCount: sql<number>`(
        SELECT COUNT(*) FROM member
        WHERE member.endeavor_id = ${endeavor.id} AND member.status = 'approved'
      )::int`,
    })
    .from(endeavor)
    .innerJoin(user, eq(endeavor.creatorId, user.id))
    .where(
      sql`${endeavor.needs} IS NOT NULL AND array_length(${endeavor.needs}, 1) > 0
        AND (${endeavor.status} = 'open' OR ${endeavor.status} = 'in-progress')`
    )
    .orderBy(desc(endeavor.createdAt))
    .limit(50);

  return NextResponse.json(results);
}
