import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { eq, desc, sql, or } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db
      .select({
        endeavor: endeavor,
        memberCount: sql<number>`count(${member.id})::int`,
      })
      .from(endeavor)
      .leftJoin(
        member,
        sql`${member.endeavorId} = ${endeavor.id} AND ${member.status} = 'approved'`
      )
      .where(or(eq(endeavor.status, "open"), eq(endeavor.status, "in-progress")))
      .groupBy(endeavor.id)
      .orderBy(desc(sql`count(${member.id})`), desc(endeavor.createdAt))
      .limit(3);

    const featured = results.map((r) => ({
      id: r.endeavor.id,
      title: r.endeavor.title,
      description: r.endeavor.description,
      category: r.endeavor.category,
      memberCount: (r.memberCount || 0) + 1, // +1 for creator
    }));

    return NextResponse.json(featured);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
