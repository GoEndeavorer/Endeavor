import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { ne, and, isNotNull, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — endeavors with locations for map view
export async function GET() {
  const results = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      category: endeavor.category,
      location: endeavor.location,
      locationType: endeavor.locationType,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
      memberCount: sql<number>`(
        SELECT COUNT(*) FROM member
        WHERE member.endeavor_id = ${endeavor.id}
        AND member.status = 'approved'
      )`,
    })
    .from(endeavor)
    .where(
      and(
        ne(endeavor.status, "cancelled"),
        ne(endeavor.status, "draft"),
        isNotNull(endeavor.location)
      )
    )
    .limit(200);

  return NextResponse.json(results);
}
