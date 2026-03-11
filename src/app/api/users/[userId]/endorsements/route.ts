import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list endorsements received by a user (on their created endeavors)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const result = await db.execute(sql`
    SELECT
      e.id,
      e.content,
      e.rating,
      e.created_at AS "createdAt",
      u.id AS "fromUserId",
      u.name AS "fromUserName",
      u.image AS "fromUserImage",
      en.id AS "endeavorId",
      en.title AS "endeavorTitle",
      en.category AS "endeavorCategory"
    FROM endorsement e
    INNER JOIN "user" u ON e.author_id = u.id
    INNER JOIN endeavor en ON e.endeavor_id = en.id
    WHERE en.creator_id = ${userId}
    ORDER BY e.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}
