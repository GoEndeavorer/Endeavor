import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, user } from "@/lib/db/schema";
import { sql, or, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ endeavors: [], users: [] });
  }

  const searchPattern = `%${q}%`;

  // Search endeavors
  const endeavors = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      category: endeavor.category,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
    })
    .from(endeavor)
    .where(
      or(
        sql`${endeavor.title} ILIKE ${searchPattern}`,
        sql`${endeavor.description} ILIKE ${searchPattern}`,
        sql`${endeavor.location} ILIKE ${searchPattern}`,
        sql`EXISTS (SELECT 1 FROM unnest(${endeavor.needs}) AS n WHERE n ILIKE ${searchPattern})`
      )
    )
    .limit(10);

  // Search users (only public info)
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      bio: user.bio,
      image: user.image,
    })
    .from(user)
    .where(
      or(
        sql`${user.name} ILIKE ${searchPattern}`,
        sql`${user.bio} ILIKE ${searchPattern}`,
        sql`EXISTS (SELECT 1 FROM unnest(${user.skills}) AS s WHERE s ILIKE ${searchPattern})`,
        sql`EXISTS (SELECT 1 FROM unnest(${user.interests}) AS i WHERE i ILIKE ${searchPattern})`
      )
    )
    .limit(5);

  return NextResponse.json({ endeavors, users });
}
