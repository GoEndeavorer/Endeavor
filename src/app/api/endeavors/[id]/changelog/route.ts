import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - returns a changelog of significant events for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Aggregate key events: milestones completed, status changes, member joins, stories published
  const result = await db.execute(sql`
    (
      SELECT
        'milestone' as type,
        mi.title as title,
        'Milestone completed' as description,
        mi.completed_at as event_date
      FROM milestone mi
      WHERE mi.endeavor_id = ${id} AND mi.completed = true AND mi.completed_at IS NOT NULL
    )
    UNION ALL
    (
      SELECT
        'story' as type,
        s.title as title,
        'Story published' as description,
        s.created_at as event_date
      FROM story s
      WHERE s.endeavor_id = ${id} AND s.published = true
    )
    UNION ALL
    (
      SELECT
        'member' as type,
        u.name as title,
        'Joined the endeavor' as description,
        m.joined_at as event_date
      FROM member m
      JOIN "user" u ON m.user_id = u.id
      WHERE m.endeavor_id = ${id} AND m.status = 'approved'
    )
    ORDER BY event_date DESC
    LIMIT 30
  `);

  return NextResponse.json(result.rows);
}
