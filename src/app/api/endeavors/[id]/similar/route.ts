import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { eq, ne, and, or, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get the current endeavor's category and needs
  const [current] = await db
    .select({
      category: endeavor.category,
      needs: endeavor.needs,
    })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!current) {
    return NextResponse.json([]);
  }

  // Find similar endeavors by category, excluding the current one and cancelled/draft ones
  const similar = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      category: endeavor.category,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
      memberCount: sql<number>`(SELECT COUNT(*) FROM member WHERE member.endeavor_id = ${endeavor.id} AND member.status = 'approved')::int`,
    })
    .from(endeavor)
    .where(
      and(
        ne(endeavor.id, id),
        eq(endeavor.category, current.category),
        or(
          eq(endeavor.status, "open"),
          eq(endeavor.status, "in-progress")
        )
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(3);

  return NextResponse.json(similar);
}
