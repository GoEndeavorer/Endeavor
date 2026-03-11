import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { follow, endeavor, member, update, story } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql, inArray } from "drizzle-orm";

// GET /api/feed — activity from users you follow
// Query params: category, status (open|in-progress|all), sort (newest|most-members|trending), q (search)
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const categoryFilter = searchParams.get("category");
  const statusFilter = searchParams.get("status") || "all";
  const sortOption = searchParams.get("sort") || "newest";
  const searchQuery = searchParams.get("q");

  // Get IDs of users the current user follows
  const following = await db
    .select({ followingId: follow.followingId })
    .from(follow)
    .where(eq(follow.followerId, session.user.id));

  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return NextResponse.json([]);
  }

  // Build endeavor conditions
  const endeavorConditions = [inArray(endeavor.creatorId, followingIds)];
  if (categoryFilter) {
    endeavorConditions.push(eq(endeavor.category, categoryFilter));
  }
  if (statusFilter && statusFilter !== "all") {
    endeavorConditions.push(eq(endeavor.status, statusFilter as "open" | "in-progress" | "completed" | "draft" | "cancelled"));
  }
  if (searchQuery) {
    endeavorConditions.push(
      sql`(${endeavor.title} ILIKE ${"%" + searchQuery + "%"} OR ${endeavor.description} ILIKE ${"%" + searchQuery + "%"})`
    );
  }

  // Get recent endeavors created by followed users
  const recentEndeavors = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      category: endeavor.category,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
      creatorId: endeavor.creatorId,
      createdAt: endeavor.createdAt,
      memberCount: sql<number>`(SELECT COUNT(*) FROM member WHERE member.endeavor_id = ${endeavor.id} AND member.status = 'approved')::int`,
    })
    .from(endeavor)
    .where(and(...endeavorConditions))
    .orderBy(sql`${endeavor.createdAt} DESC`)
    .limit(20);

  // Build update conditions — filter by endeavor category/status via subquery
  const updateBaseCondition = inArray(update.authorId, followingIds);
  const updateConditions = [updateBaseCondition];
  if (categoryFilter || (statusFilter && statusFilter !== "all")) {
    const subConditions: string[] = [];
    if (categoryFilter) subConditions.push(`e.category = '${categoryFilter.replace(/'/g, "''")}'`);
    if (statusFilter && statusFilter !== "all") subConditions.push(`e.status = '${statusFilter.replace(/'/g, "''")}'`);
    updateConditions.push(
      sql`EXISTS (SELECT 1 FROM endeavor e WHERE e.id = ${update.endeavorId} AND ${sql.raw(subConditions.join(" AND "))})`
    );
  }
  if (searchQuery) {
    updateConditions.push(
      sql`(${update.title} ILIKE ${"%" + searchQuery + "%"} OR ${update.content} ILIKE ${"%" + searchQuery + "%"})`
    );
  }

  // Get recent updates posted by followed users
  const recentUpdates = await db
    .select({
      id: update.id,
      title: update.title,
      content: update.content,
      authorId: update.authorId,
      endeavorId: update.endeavorId,
      endeavorTitle: endeavor.title,
      createdAt: update.createdAt,
    })
    .from(update)
    .innerJoin(endeavor, eq(update.endeavorId, endeavor.id))
    .where(and(...updateConditions))
    .orderBy(sql`${update.createdAt} DESC`)
    .limit(10);

  // Build story conditions
  const storyBaseConditions = [inArray(story.authorId, followingIds), eq(story.published, true)];
  if (categoryFilter || (statusFilter && statusFilter !== "all")) {
    const subConditions: string[] = [];
    if (categoryFilter) subConditions.push(`e.category = '${categoryFilter.replace(/'/g, "''")}'`);
    if (statusFilter && statusFilter !== "all") subConditions.push(`e.status = '${statusFilter.replace(/'/g, "''")}'`);
    storyBaseConditions.push(
      sql`EXISTS (SELECT 1 FROM endeavor e WHERE e.id = ${story.endeavorId} AND ${sql.raw(subConditions.join(" AND "))})`
    );
  }
  if (searchQuery) {
    storyBaseConditions.push(
      sql`(${story.title} ILIKE ${"%" + searchQuery + "%"})`
    );
  }

  // Get recent stories by followed users
  const recentStories = await db
    .select({
      id: story.id,
      title: story.title,
      authorId: story.authorId,
      endeavorId: story.endeavorId,
      endeavorTitle: endeavor.title,
      createdAt: story.createdAt,
    })
    .from(story)
    .innerJoin(endeavor, eq(story.endeavorId, endeavor.id))
    .where(and(...storyBaseConditions))
    .orderBy(sql`${story.createdAt} DESC`)
    .limit(10);

  // Merge and sort
  type FeedItem = {
    type: "endeavor" | "update" | "story";
    id: string;
    title: string;
    detail: string | null;
    endeavorId: string | null;
    endeavorTitle: string | null;
    category: string | null;
    status: string | null;
    userId: string;
    imageUrl: string | null;
    memberCount: number;
    createdAt: Date;
  };

  const items: FeedItem[] = [
    ...recentEndeavors.map((e) => ({
      type: "endeavor" as const,
      id: e.id,
      title: e.title,
      detail: `${e.category} · ${e.memberCount} members`,
      endeavorId: e.id,
      endeavorTitle: e.title,
      category: e.category,
      status: e.status,
      userId: e.creatorId,
      imageUrl: e.imageUrl,
      memberCount: e.memberCount,
      createdAt: e.createdAt,
    })),
    ...recentUpdates.map((u) => ({
      type: "update" as const,
      id: u.id,
      title: u.title,
      detail: u.content.slice(0, 120),
      endeavorId: u.endeavorId,
      endeavorTitle: u.endeavorTitle,
      category: null,
      status: null,
      userId: u.authorId,
      imageUrl: null,
      memberCount: 0,
      createdAt: u.createdAt,
    })),
    ...recentStories.map((s) => ({
      type: "story" as const,
      id: s.id,
      title: s.title,
      detail: null,
      endeavorId: s.endeavorId,
      endeavorTitle: s.endeavorTitle,
      category: null,
      status: null,
      userId: s.authorId,
      imageUrl: null,
      memberCount: 0,
      createdAt: s.createdAt,
    })),
  ];

  // Sort based on option
  if (sortOption === "most-members") {
    items.sort((a, b) => b.memberCount - a.memberCount);
  } else if (sortOption === "trending") {
    // Trending: weight recent items with more members higher
    const now = Date.now();
    items.sort((a, b) => {
      const ageA = (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
      const ageB = (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
      const scoreA = (a.memberCount + 1) / Math.pow(ageA + 2, 1.5);
      const scoreB = (b.memberCount + 1) / Math.pow(ageB + 2, 1.5);
      return scoreB - scoreA;
    });
  } else {
    // newest (default)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json(items.slice(0, 30));
}
