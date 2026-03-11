import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, user, story, discussion } from "@/lib/db/schema";
import { sql, or, eq, and, desc, ilike, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const type = params.get("type")?.trim() || "all";
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const category = params.get("category")?.trim();
  const status = params.get("status")?.trim();
  const sort = params.get("sort")?.trim() || "relevant";

  // If no query and no filters, return empty
  if ((!q || q.length < 2) && !category && !status) {
    return NextResponse.json({
      endeavors: [],
      users: [],
      categories: [],
      stories: [],
      discussions: [],
      counts: { endeavors: 0, users: 0, categories: 0, stories: 0, discussions: 0, total: 0 },
      page,
      pageSize: PAGE_SIZE,
      hasMore: false,
    });
  }

  const offset = (page - 1) * PAGE_SIZE;
  const searchPattern = q && q.length >= 2 ? `%${q}%` : null;

  // ── Endeavors ──────────────────────────────────────────────────────────────

  let endeavors: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    locationType: string;
    imageUrl: string | null;
    memberCount: number;
  }[] = [];
  let endeavorCount = 0;

  if (type === "all" || type === "endeavor") {
    const conditions: SQL[] = [];

    if (searchPattern) {
      conditions.push(
        sql`(${endeavor.title} ILIKE ${searchPattern}
          OR ${endeavor.description} ILIKE ${searchPattern}
          OR ${endeavor.location} ILIKE ${searchPattern}
          OR EXISTS (SELECT 1 FROM unnest(${endeavor.needs}) AS n WHERE n ILIKE ${searchPattern}))`
      );
    }

    if (category) {
      conditions.push(eq(endeavor.category, category));
    }

    if (status) {
      conditions.push(eq(endeavor.status, status as "open" | "in-progress" | "completed" | "draft" | "cancelled"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sort clause
    let orderBy: SQL;
    if (sort === "newest") {
      orderBy = desc(endeavor.createdAt);
    } else if (sort === "popular") {
      orderBy = sql`(SELECT COUNT(*) FROM "member" WHERE "member"."endeavor_id" = ${endeavor.id} AND "member"."status" = 'approved') DESC`;
    } else {
      orderBy = desc(endeavor.createdAt);
    }

    // Count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(endeavor)
      .where(whereClause);
    endeavorCount = countResult?.count || 0;

    // Paginated results with member count subselect
    endeavors = await db
      .select({
        id: endeavor.id,
        title: endeavor.title,
        description: endeavor.description,
        category: endeavor.category,
        status: endeavor.status,
        locationType: endeavor.locationType,
        imageUrl: endeavor.imageUrl,
        memberCount: sql<number>`(SELECT COUNT(*)::int FROM "member" WHERE "member"."endeavor_id" = ${endeavor.id} AND "member"."status" = 'approved')`,
      })
      .from(endeavor)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset(offset);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  let users: {
    id: string;
    name: string;
    bio: string | null;
    image: string | null;
    skills: string[] | null;
    location: string | null;
  }[] = [];
  let userCount = 0;

  if ((type === "all" || type === "user") && searchPattern) {
    const userWhere = or(
      sql`${user.name} ILIKE ${searchPattern}`,
      sql`${user.bio} ILIKE ${searchPattern}`,
      sql`EXISTS (SELECT 1 FROM unnest(${user.skills}) AS s WHERE s ILIKE ${searchPattern})`,
      sql`EXISTS (SELECT 1 FROM unnest(${user.interests}) AS i WHERE i ILIKE ${searchPattern})`
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(userWhere);
    userCount = countResult?.count || 0;

    users = await db
      .select({
        id: user.id,
        name: user.name,
        bio: user.bio,
        image: user.image,
        skills: user.skills,
        location: user.location,
      })
      .from(user)
      .where(userWhere)
      .limit(PAGE_SIZE)
      .offset(offset);
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  let categories: { category: string; count: number }[] = [];
  let categoryCount = 0;

  if ((type === "all" || type === "category") && searchPattern) {
    const catResults = await db
      .select({
        category: endeavor.category,
        count: sql<number>`count(*)::int`,
      })
      .from(endeavor)
      .where(sql`${endeavor.category} ILIKE ${searchPattern}`)
      .groupBy(endeavor.category)
      .orderBy(sql`count(*) DESC`);

    categories = catResults;
    categoryCount = catResults.length;
  }

  // ── Stories ────────────────────────────────────────────────────────────────

  let stories: { id: string; title: string; endeavorId: string; authorName: string; createdAt: Date }[] = [];
  let storyCount = 0;

  if ((type === "all" || type === "endeavor") && searchPattern) {
    const storyWhere = and(
      eq(story.published, true),
      or(
        ilike(story.title, searchPattern),
        ilike(story.content, searchPattern)
      )
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(story)
      .innerJoin(user, eq(story.authorId, user.id))
      .where(storyWhere);
    storyCount = countResult?.count || 0;

    stories = await db
      .select({
        id: story.id,
        title: story.title,
        endeavorId: story.endeavorId,
        authorName: user.name,
        createdAt: story.createdAt,
      })
      .from(story)
      .innerJoin(user, eq(story.authorId, user.id))
      .where(storyWhere)
      .orderBy(desc(story.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);
  }

  // ── Discussions ────────────────────────────────────────────────────────────

  let discussions: { id: string; content: string; endeavorId: string; authorName: string; createdAt: Date }[] = [];
  let discussionCount = 0;

  if ((type === "all" || type === "endeavor") && searchPattern) {
    const discWhere = ilike(discussion.content, searchPattern);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(discussion)
      .innerJoin(user, eq(discussion.authorId, user.id))
      .where(discWhere);
    discussionCount = countResult?.count || 0;

    discussions = await db
      .select({
        id: discussion.id,
        content: discussion.content,
        endeavorId: discussion.endeavorId,
        authorName: user.name,
        createdAt: discussion.createdAt,
      })
      .from(discussion)
      .innerJoin(user, eq(discussion.authorId, user.id))
      .where(discWhere)
      .orderBy(desc(discussion.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);
  }

  // ── Response ───────────────────────────────────────────────────────────────

  const total = endeavorCount + userCount + categoryCount + storyCount + discussionCount;
  const currentTypeCount =
    type === "endeavor" ? endeavorCount :
    type === "user" ? userCount :
    type === "category" ? categoryCount :
    total;
  const hasMore = offset + PAGE_SIZE < currentTypeCount;

  return NextResponse.json({
    endeavors,
    users,
    categories,
    stories,
    discussions,
    counts: {
      endeavors: endeavorCount,
      users: userCount,
      categories: categoryCount,
      stories: storyCount,
      discussions: discussionCount,
      total,
    },
    page,
    pageSize: PAGE_SIZE,
    hasMore,
  });
}
