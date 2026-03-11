import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;

  const result = await db.execute(sql`
    SELECT g.*, u.name as creator_name, u.image as creator_image
    FROM community_group g
    JOIN "user" u ON g.creator_id = u.id
    WHERE g.id = ${groupId}
  `);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Get members
  const members = await db.execute(sql`
    SELECT gm.*, u.name, u.image
    FROM group_member gm
    JOIN "user" u ON gm.user_id = u.id
    WHERE gm.group_id = ${groupId}
    ORDER BY gm.role DESC, gm.joined_at ASC
    LIMIT 50
  `);

  return NextResponse.json({ ...result.rows[0], members: members.rows });
}
