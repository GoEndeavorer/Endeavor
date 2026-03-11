import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
  const type = searchParams.get("type");

  // Unified activity stream
  let query;
  if (type === "endeavors") {
    query = sql`
      SELECT 'endeavor' as type, e.id as target_id, e.title, NULL as body,
        e.category as context, e."createdAt" as created_at
      FROM endeavor e WHERE e."creatorId" = ${userId}
      ORDER BY e."createdAt" DESC LIMIT ${limit}
    `;
  } else if (type === "stories") {
    query = sql`
      SELECT 'story' as type, s.id as target_id, s.title, LEFT(s.content, 150) as body,
        NULL as context, s."createdAt" as created_at
      FROM story s WHERE s."authorId" = ${userId} AND s.published = true
      ORDER BY s."createdAt" DESC LIMIT ${limit}
    `;
  } else if (type === "discussions") {
    query = sql`
      SELECT 'discussion' as type, dp.id as target_id, NULL as title, LEFT(dp.body, 150) as body,
        dp.endeavor_id::text as context, dp.created_at
      FROM discussion_post dp WHERE dp.author_id = ${userId}
      ORDER BY dp.created_at DESC LIMIT ${limit}
    `;
  } else {
    query = sql`
      (
        SELECT 'endeavor' as type, e.id as target_id, e.title, NULL as body,
          e.category as context, e."createdAt" as created_at
        FROM endeavor e WHERE e."creatorId" = ${userId}
      )
      UNION ALL
      (
        SELECT 'story' as type, s.id as target_id, s.title, LEFT(s.content, 150) as body,
          NULL as context, s."createdAt" as created_at
        FROM story s WHERE s."authorId" = ${userId} AND s.published = true
      )
      UNION ALL
      (
        SELECT 'discussion' as type, dp.id as target_id, NULL as title, LEFT(dp.body, 150) as body,
          dp.endeavor_id::text as context, dp.created_at
        FROM discussion_post dp WHERE dp.author_id = ${userId}
      )
      ORDER BY created_at DESC LIMIT ${limit}
    `;
  }

  const result = await db.execute(query);
  return NextResponse.json(result.rows);
}
