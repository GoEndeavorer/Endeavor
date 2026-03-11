import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { eq, and, desc, sql, count, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Returns a "spotlight" endeavor — the most active open/in-progress endeavor
export async function GET() {
  // Find the endeavor with the most recent activity and highest member count
  const result = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      description: endeavor.description,
      category: endeavor.category,
      location: endeavor.location,
      imageUrl: endeavor.imageUrl,
      status: endeavor.status,
      creatorName: user.name,
      creatorId: user.id,
      memberCount: sql<number>`(
        SELECT COUNT(*) FROM member
        WHERE member.endeavor_id = ${endeavor.id}
        AND member.status = 'approved'
      )`,
    })
    .from(endeavor)
    .innerJoin(user, eq(endeavor.creatorId, user.id))
    .where(
      and(
        ne(endeavor.status, "cancelled"),
        ne(endeavor.status, "draft")
      )
    )
    .orderBy(
      sql`(
        SELECT COUNT(*) FROM member
        WHERE member.endeavor_id = ${endeavor.id}
        AND member.status = 'approved'
      ) DESC`,
      desc(endeavor.updatedAt)
    )
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json(null);
  }

  return NextResponse.json(result[0]);
}
