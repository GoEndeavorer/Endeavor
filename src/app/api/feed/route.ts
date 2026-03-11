import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { follow, endeavor, member, update, story } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql, inArray } from "drizzle-orm";

// GET /api/feed — activity from users you follow
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get IDs of users the current user follows
  const following = await db
    .select({ followingId: follow.followingId })
    .from(follow)
    .where(eq(follow.followerId, session.user.id));

  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return NextResponse.json([]);
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
    .where(inArray(endeavor.creatorId, followingIds))
    .orderBy(sql`${endeavor.createdAt} DESC`)
    .limit(20);

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
    .where(inArray(update.authorId, followingIds))
    .orderBy(sql`${update.createdAt} DESC`)
    .limit(10);

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
    .where(and(inArray(story.authorId, followingIds), eq(story.published, true)))
    .orderBy(sql`${story.createdAt} DESC`)
    .limit(10);

  // Merge and sort by date
  type FeedItem = {
    type: "endeavor" | "update" | "story";
    id: string;
    title: string;
    detail: string | null;
    endeavorId: string | null;
    endeavorTitle: string | null;
    userId: string;
    imageUrl: string | null;
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
      userId: e.creatorId,
      imageUrl: e.imageUrl,
      createdAt: e.createdAt,
    })),
    ...recentUpdates.map((u) => ({
      type: "update" as const,
      id: u.id,
      title: u.title,
      detail: u.content.slice(0, 120),
      endeavorId: u.endeavorId,
      endeavorTitle: u.endeavorTitle,
      userId: u.authorId,
      imageUrl: null,
      createdAt: u.createdAt,
    })),
    ...recentStories.map((s) => ({
      type: "story" as const,
      id: s.id,
      title: s.title,
      detail: null,
      endeavorId: s.endeavorId,
      endeavorTitle: s.endeavorTitle,
      userId: s.authorId,
      imageUrl: null,
      createdAt: s.createdAt,
    })),
  ];

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(items.slice(0, 30));
}
