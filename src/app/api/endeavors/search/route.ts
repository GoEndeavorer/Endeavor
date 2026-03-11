import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") || "newest";
  const limit = Math.min(50, Number(searchParams.get("limit")) || 20);

  if (!q && !category && !status) {
    return NextResponse.json([]);
  }

  let orderClause = 'e."createdAt" DESC';
  if (sort === "popular") orderClause = "member_count DESC, vote_count DESC";
  if (sort === "updated") orderClause = 'e."updatedAt" DESC';

  // Build WHERE conditions
  const conditions: string[] = [];
  if (q) conditions.push(`(e.title ILIKE '%${q.replace(/'/g, "''")}%' OR e.description ILIKE '%${q.replace(/'/g, "''")}%')`);
  if (category) conditions.push(`e.category = '${category.replace(/'/g, "''")}'`);
  if (status) conditions.push(`e.status = '${status.replace(/'/g, "''")}'`);

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute(
    sql.raw(`
      SELECT e.*, u.name as creator_name,
        (SELECT COUNT(*) FROM endeavor_member em WHERE em.endeavor_id = e.id)::int as member_count,
        COALESCE(e."voteCount", 0) as vote_count
      FROM endeavor e
      JOIN "user" u ON e."creatorId" = u.id
      ${whereClause}
      ORDER BY ${orderClause}
      LIMIT ${limit}
    `)
  );

  return NextResponse.json(result.rows);
}
