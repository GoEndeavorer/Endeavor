import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const skill = searchParams.get("skill");
  const sort = searchParams.get("sort") || "name";

  let query = `
    SELECT u.id, u.name, u.email, u.image, u."createdAt",
      (SELECT COUNT(*) FROM endeavor e WHERE e."creatorId" = u.id) as endeavor_count,
      (SELECT COUNT(*) FROM endeavor_member em WHERE em.user_id = u.id) as membership_count,
      (SELECT COALESCE(SUM(xp), 0) FROM user_xp WHERE user_id = u.id) as total_xp
    FROM "user" u
    WHERE 1=1
  `;

  if (search) {
    query += ` AND (u.name ILIKE '%${search.replace(/'/g, "''")}%' OR u.email ILIKE '%${search.replace(/'/g, "''")}%')`;
  }

  if (sort === "xp") {
    query += ` ORDER BY total_xp DESC`;
  } else if (sort === "projects") {
    query += ` ORDER BY endeavor_count DESC`;
  } else if (sort === "recent") {
    query += ` ORDER BY u."createdAt" DESC`;
  } else {
    query += ` ORDER BY u.name ASC`;
  }

  query += ` LIMIT 50`;

  const result = await db.execute(sql.raw(query));
  return NextResponse.json(result.rows);
}
