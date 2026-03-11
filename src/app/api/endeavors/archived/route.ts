import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
  const statusFilter = searchParams.get("status"); // "completed" | "cancelled" | null (both)

  const statusClause =
    statusFilter === "completed"
      ? sql`AND e.status = 'completed'`
      : statusFilter === "cancelled"
        ? sql`AND e.status = 'cancelled'`
        : sql``;

  const result = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.category,
      e.status,
      e.image_url AS "imageUrl",
      e.tagline,
      e.updated_at AS "updatedAt",
      (SELECT COUNT(*)::int FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') AS "memberCount",
      u.name AS "creatorName"
    FROM endeavor e
    JOIN "user" u ON u.id = e.creator_id
    WHERE e.status IN ('completed', 'cancelled')
    ${statusClause}
    ORDER BY e.updated_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  const rows = result.rows as {
    id: string;
    title: string;
    category: string;
    status: string;
    imageUrl: string | null;
    tagline: string | null;
    updatedAt: string;
    memberCount: number;
    creatorName: string;
  }[];

  // Get total count for pagination
  const countResult = await db.execute(sql`
    SELECT COUNT(*)::int AS total
    FROM endeavor e
    WHERE e.status IN ('completed', 'cancelled')
    ${statusClause}
  `);

  const total = (countResult.rows as { total: number }[])[0]?.total ?? 0;

  return NextResponse.json({
    endeavors: rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      imageUrl: r.imageUrl,
      tagline: r.tagline,
      updatedAt: r.updatedAt,
      memberCount: (r.memberCount || 0) + 1, // +1 for creator
      creatorName: r.creatorName,
    })),
    total,
    hasMore: offset + limit < total,
  });
}
