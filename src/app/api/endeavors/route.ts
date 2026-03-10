import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const locationType = searchParams.get("locationType");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const conditions = [eq(endeavor.status, "open")];

  if (category) {
    conditions.push(eq(endeavor.category, category));
  }
  if (locationType) {
    conditions.push(
      eq(
        endeavor.locationType,
        locationType as "in-person" | "remote" | "either"
      )
    );
  }
  if (location) {
    conditions.push(ilike(endeavor.location, `%${location}%`));
  }
  if (search) {
    conditions.push(
      or(
        ilike(endeavor.title, `%${search}%`),
        ilike(endeavor.description, `%${search}%`)
      )!
    );
  }

  const results = await db
    .select()
    .from(endeavor)
    .where(conditions.length > 1 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : conditions[0])
    .orderBy(desc(endeavor.createdAt))
    .limit(limit)
    .offset(offset);

  // Get member counts for each endeavor
  const endeavorIds = results.map((e) => e.id);
  const memberCounts =
    endeavorIds.length > 0
      ? await db
          .select({
            endeavorId: member.endeavorId,
            count: sql<number>`count(*)::int`,
          })
          .from(member)
          .where(
            sql`${member.endeavorId} IN (${sql.join(
              endeavorIds.map((id) => sql`${id}`),
              sql`, `
            )}) AND ${member.status} = 'approved'`
          )
          .groupBy(member.endeavorId)
      : [];

  const countMap = new Map(memberCounts.map((m) => [m.endeavorId, m.count]));

  const enriched = results.map((e) => ({
    ...e,
    memberCount: (countMap.get(e.id) || 0) + 1, // +1 for creator
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    description,
    category,
    location,
    locationType: locType,
    needs,
    costPerPerson,
    capacity,
    fundingEnabled,
    fundingGoal,
    joinType,
  } = body;

  if (!title || !description || !category) {
    return NextResponse.json(
      { error: "Title, description, and category are required" },
      { status: 400 }
    );
  }

  const [newEndeavor] = await db
    .insert(endeavor)
    .values({
      title,
      description,
      category,
      location: location || null,
      locationType: locType || "in-person",
      needs: needs || [],
      costPerPerson: costPerPerson ? parseInt(costPerPerson) : null,
      capacity: capacity ? parseInt(capacity) : null,
      fundingEnabled: fundingEnabled || false,
      fundingGoal: fundingGoal ? parseInt(fundingGoal) : null,
      joinType: joinType || "open",
      creatorId: session.user.id,
    })
    .returning();

  // Auto-add creator as a member
  await db.insert(member).values({
    endeavorId: newEndeavor.id,
    userId: session.user.id,
    role: "creator",
    status: "approved",
  });

  return NextResponse.json(newEndeavor, { status: 201 });
}
