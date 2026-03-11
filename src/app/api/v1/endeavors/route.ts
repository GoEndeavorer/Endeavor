import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { desc, eq, sql, ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — public API for listing endeavors (v1)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "open";
  const search = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  const conditions = [eq(endeavor.status, status as "open" | "in-progress" | "completed")];

  if (category) {
    conditions.push(eq(endeavor.category, category));
  }
  if (search) {
    conditions.push(
      or(
        ilike(endeavor.title, `%${search}%`),
        ilike(endeavor.description, `%${search}%`)
      )!
    );
  }

  const results = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      description: endeavor.description,
      category: endeavor.category,
      status: endeavor.status,
      location: endeavor.location,
      locationType: endeavor.locationType,
      needs: endeavor.needs,
      fundingEnabled: endeavor.fundingEnabled,
      fundingGoal: endeavor.fundingGoal,
      fundingRaised: endeavor.fundingRaised,
      imageUrl: endeavor.imageUrl,
      createdAt: endeavor.createdAt,
      memberCount: sql<number>`(SELECT COUNT(*)::int FROM member WHERE member.endeavor_id = ${endeavor.id} AND member.status = 'approved')`,
    })
    .from(endeavor)
    .where(conditions.length > 1 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : conditions[0])
    .orderBy(desc(endeavor.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    data: results,
    pagination: { limit, offset, count: results.length },
  }, {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
