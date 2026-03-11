import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Get mutual connections (both follow each other)
  const result = await db.execute(sql`
    SELECT u.id, u.name, u.image
    FROM follow f1
    JOIN follow f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
    JOIN "user" u ON f1.following_id = u.id
    WHERE f1.follower_id = ${userId}
    ORDER BY u.name ASC
  `);

  return NextResponse.json(result.rows);
}
