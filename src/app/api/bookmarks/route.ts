import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookmark, endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

// GET /api/bookmarks — list user's bookmarks
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await db
    .select({
      id: bookmark.id,
      endeavorId: bookmark.endeavorId,
      createdAt: bookmark.createdAt,
      title: endeavor.title,
      category: endeavor.category,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
      description: endeavor.description,
      memberCount: sql<number>`(SELECT COUNT(*) FROM member WHERE member.endeavor_id = ${endeavor.id} AND member.status = 'approved')::int`,
    })
    .from(bookmark)
    .innerJoin(endeavor, eq(bookmark.endeavorId, endeavor.id))
    .where(eq(bookmark.userId, session.user.id))
    .orderBy(sql`${bookmark.createdAt} DESC`);

  return NextResponse.json(bookmarks);
}

// POST /api/bookmarks — toggle bookmark
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endeavorId } = await request.json();
  if (!endeavorId) {
    return NextResponse.json({ error: "endeavorId required" }, { status: 400 });
  }

  // Check if already bookmarked
  const existing = await db
    .select({ id: bookmark.id })
    .from(bookmark)
    .where(
      and(
        eq(bookmark.userId, session.user.id),
        eq(bookmark.endeavorId, endeavorId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove bookmark
    await db
      .delete(bookmark)
      .where(eq(bookmark.id, existing[0].id));
    return NextResponse.json({ bookmarked: false });
  }

  // Add bookmark
  await db.insert(bookmark).values({
    userId: session.user.id,
    endeavorId,
  });

  return NextResponse.json({ bookmarked: true });
}
