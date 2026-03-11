import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const [categoryCounts, totalEndeavors, totalUsers, totalMembers] = await Promise.all([
    db
      .select({
        category: endeavor.category,
        count: sql<number>`count(*)::int`,
      })
      .from(endeavor)
      .where(sql`${endeavor.status} IN ('open', 'in-progress')`)
      .groupBy(endeavor.category),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(endeavor)
      .where(sql`${endeavor.status} IN ('open', 'in-progress', 'completed')`),
    db.select({ count: sql<number>`count(*)::int` }).from(user),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(member)
      .where(sql`${member.status} = 'approved'`),
  ]);

  return NextResponse.json({
    categories: categoryCounts,
    totalEndeavors: totalEndeavors[0]?.count || 0,
    totalUsers: totalUsers[0]?.count || 0,
    totalMembers: totalMembers[0]?.count || 0,
  });
}
