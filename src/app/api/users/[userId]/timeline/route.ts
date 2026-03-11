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
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  const result = await db.execute(sql`
    (
      SELECT
        e.id,
        'endeavor_created' as type,
        e.title as title,
        NULL as detail,
        e.id as "endeavorId",
        e.created_at as "createdAt"
      FROM endeavor e
      WHERE e.creator_id = ${userId}
      ORDER BY e.created_at DESC
      LIMIT 20
    )
    UNION ALL
    (
      SELECT
        m.id::text,
        'joined_endeavor' as type,
        e.title as title,
        NULL as detail,
        e.id as "endeavorId",
        m.joined_at as "createdAt"
      FROM member m
      JOIN endeavor e ON e.id = m.endeavor_id
      WHERE m.user_id = ${userId}
      ORDER BY m.joined_at DESC
      LIMIT 20
    )
    UNION ALL
    (
      SELECT
        d.id::text,
        'discussion' as type,
        LEFT(d.content, 100) as title,
        NULL as detail,
        d.endeavor_id as "endeavorId",
        d.created_at as "createdAt"
      FROM discussion d
      WHERE d.author_id = ${userId}
      ORDER BY d.created_at DESC
      LIMIT 20
    )
    UNION ALL
    (
      SELECT
        s.id::text,
        'story_published' as type,
        s.title as title,
        NULL as detail,
        s.endeavor_id as "endeavorId",
        s.created_at as "createdAt"
      FROM story s
      WHERE s.author_id = ${userId} AND s.published = true
      ORDER BY s.created_at DESC
      LIMIT 20
    )
    UNION ALL
    (
      SELECT
        ms.id::text,
        'milestone_completed' as type,
        ms.title as title,
        NULL as detail,
        ms.endeavor_id as "endeavorId",
        ms.completed_at as "createdAt"
      FROM milestone ms
      WHERE ms.completed_by = ${userId} AND ms.completed = true
      ORDER BY ms.completed_at DESC
      LIMIT 20
    )
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  const items = (result.rows as {
    id: string;
    type: string;
    title: string;
    detail: string | null;
    endeavorId: string | null;
    createdAt: string;
  }[]).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    detail: row.detail,
    endeavorId: row.endeavorId,
    createdAt: row.createdAt,
  }));

  return NextResponse.json(items);
}
