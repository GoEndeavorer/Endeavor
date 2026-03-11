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
  const role = searchParams.get("role") || "all";

  let result;
  if (role === "created") {
    result = await db.execute(sql`
      SELECT e.id, e.title, e.description, e.category, e.status, e."imageUrl",
        e."createdAt", e."updatedAt",
        (SELECT COUNT(*)::int FROM endeavor_member em WHERE em.endeavor_id = e.id) as member_count
      FROM endeavor e
      WHERE e."creatorId" = ${userId}
      ORDER BY e."updatedAt" DESC
    `);
  } else if (role === "member") {
    result = await db.execute(sql`
      SELECT e.id, e.title, e.description, e.category, e.status, e."imageUrl",
        e."createdAt", e."updatedAt", em.role,
        (SELECT COUNT(*)::int FROM endeavor_member em2 WHERE em2.endeavor_id = e.id) as member_count
      FROM endeavor_member em
      JOIN endeavor e ON em.endeavor_id = e.id
      WHERE em.user_id = ${userId} AND e."creatorId" != ${userId}
      ORDER BY e."updatedAt" DESC
    `);
  } else {
    result = await db.execute(sql`
      SELECT e.id, e.title, e.description, e.category, e.status, e."imageUrl",
        e."createdAt", e."updatedAt",
        CASE WHEN e."creatorId" = ${userId} THEN 'creator' ELSE em.role END as role,
        (SELECT COUNT(*)::int FROM endeavor_member em2 WHERE em2.endeavor_id = e.id) as member_count
      FROM endeavor e
      LEFT JOIN endeavor_member em ON em.endeavor_id = e.id AND em.user_id = ${userId}
      WHERE e."creatorId" = ${userId} OR em.user_id = ${userId}
      ORDER BY e."updatedAt" DESC
    `);
  }

  return NextResponse.json(result.rows);
}
