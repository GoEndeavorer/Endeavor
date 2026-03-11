import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { sql, or, eq, and, desc, ilike, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const category = params.get("category")?.trim();
  const status = params.get("status")?.trim();
  const locationType = params.get("locationType")?.trim();
  const sort = params.get("sort")?.trim() || "relevant";

  // If no query and no filters, return empty
  if ((!q || q.length < 2) && !category && !status && !locationType) {
    return NextResponse.json({ endeavors: [], users: [] });
  }

  // ── Build endeavor filter conditions ─────────────────────────────────────

  const conditions: SQL[] = [];

  // Text search (if query provided)
  if (q && q.length >= 2) {
    const searchPattern = `%${q}%`;
    conditions.push(
      sql`(${endeavor.title} ILIKE ${searchPattern}
        OR ${endeavor.description} ILIKE ${searchPattern}
        OR ${endeavor.location} ILIKE ${searchPattern}
        OR EXISTS (SELECT 1 FROM unnest(${endeavor.needs}) AS n WHERE n ILIKE ${searchPattern}))`
    );
  }

  // Category filter
  if (category) {
    conditions.push(eq(endeavor.category, category));
  }

  // Status filter (open, in-progress, completed)
  if (status) {
    conditions.push(eq(endeavor.status, status as "open" | "in-progress" | "completed" | "draft" | "cancelled"));
  }

  // Location type filter (in-person, remote, either)
  if (locationType) {
    conditions.push(eq(endeavor.locationType, locationType as "in-person" | "remote" | "either"));
  }

  // ── Build sort / order clause ────────────────────────────────────────────

  let orderBy: SQL;
  if (sort === "newest") {
    orderBy = desc(endeavor.createdAt);
  } else if (sort === "popular") {
    // Sub-select: count approved members
    orderBy = sql`(SELECT COUNT(*) FROM "member" WHERE "member"."endeavor_id" = ${endeavor.id} AND "member"."status" = 'approved') DESC`;
  } else {
    // "relevant" — default: newest as a sensible fallback
    orderBy = desc(endeavor.createdAt);
  }

  // ── Query endeavors ──────────────────────────────────────────────────────

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const endeavors = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      category: endeavor.category,
      status: endeavor.status,
      locationType: endeavor.locationType,
      imageUrl: endeavor.imageUrl,
    })
    .from(endeavor)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(10);

  // ── Search users (only when a text query is provided) ────────────────────

  let users: { id: string; name: string; bio: string | null; image: string | null }[] = [];

  if (q && q.length >= 2) {
    const searchPattern = `%${q}%`;
    users = await db
      .select({
        id: user.id,
        name: user.name,
        bio: user.bio,
        image: user.image,
      })
      .from(user)
      .where(
        or(
          sql`${user.name} ILIKE ${searchPattern}`,
          sql`${user.bio} ILIKE ${searchPattern}`,
          sql`EXISTS (SELECT 1 FROM unnest(${user.skills}) AS s WHERE s ILIKE ${searchPattern})`,
          sql`EXISTS (SELECT 1 FROM unnest(${user.interests}) AS i WHERE i ILIKE ${searchPattern})`
        )
      )
      .limit(5);
  }

  return NextResponse.json({ endeavors, users });
}
