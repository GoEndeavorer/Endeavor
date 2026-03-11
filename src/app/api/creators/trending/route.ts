import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, endeavor, member } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — trending creators based on recent activity and member growth
export async function GET() {
  const creators = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
      endeavorCount: sql<number>`(
        SELECT COUNT(DISTINCT ${endeavor.id})
        FROM ${endeavor}
        WHERE ${endeavor.creatorId} = ${user.id}
        AND ${endeavor.status} != 'cancelled'
        AND ${endeavor.status} != 'draft'
      )`,
      totalMembers: sql<number>`(
        SELECT COUNT(*)
        FROM ${member}
        INNER JOIN ${endeavor} ON ${member.endeavorId} = ${endeavor.id}
        WHERE ${endeavor.creatorId} = ${user.id}
        AND ${member.status} = 'approved'
        AND ${member.role} = 'collaborator'
      )`,
    })
    .from(user)
    .where(
      sql`EXISTS (
        SELECT 1 FROM ${endeavor}
        WHERE ${endeavor.creatorId} = ${user.id}
        AND ${endeavor.status} != 'cancelled'
        AND ${endeavor.status} != 'draft'
      )`
    )
    .orderBy(
      sql`(
        SELECT COUNT(*)
        FROM ${member}
        INNER JOIN ${endeavor} ON ${member.endeavorId} = ${endeavor.id}
        WHERE ${endeavor.creatorId} = ${user.id}
        AND ${member.status} = 'approved'
      ) DESC`
    )
    .limit(6);

  return NextResponse.json(creators);
}
