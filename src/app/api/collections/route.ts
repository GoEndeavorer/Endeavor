import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookmarkCollection, bookmarkItem, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/collections — list user's collections with item counts + endeavor previews
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await db
    .select({
      id: bookmarkCollection.id,
      name: bookmarkCollection.name,
      description: bookmarkCollection.description,
      isPublic: bookmarkCollection.isPublic,
      createdAt: bookmarkCollection.createdAt,
      itemCount: sql<number>`(SELECT COUNT(*) FROM bookmark_item WHERE bookmark_item.collection_id = ${bookmarkCollection.id})::int`,
      previewThumbnails: sql<string[]>`(
        SELECT COALESCE(
          array_agg(sub.image_url) FILTER (WHERE sub.image_url IS NOT NULL),
          '{}'
        )
        FROM (
          SELECT e.image_url
          FROM bookmark_item bi
          JOIN endeavor e ON e.id = bi.endeavor_id
          WHERE bi.collection_id = ${bookmarkCollection.id}
            AND e.image_url IS NOT NULL
          ORDER BY bi.created_at DESC
          LIMIT 3
        ) sub
      )`,
      previewTitles: sql<string[]>`(
        SELECT COALESCE(array_agg(sub.title), '{}')
        FROM (
          SELECT e.title
          FROM bookmark_item bi
          JOIN endeavor e ON e.id = bi.endeavor_id
          WHERE bi.collection_id = ${bookmarkCollection.id}
          ORDER BY bi.created_at DESC
          LIMIT 3
        ) sub
      )`,
    })
    .from(bookmarkCollection)
    .where(eq(bookmarkCollection.userId, session.user.id))
    .orderBy(sql`${bookmarkCollection.createdAt} DESC`);

  return NextResponse.json(collections);
}

// POST /api/collections — create a new collection
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, isPublic } = await request.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const [collection] = await db
    .insert(bookmarkCollection)
    .values({
      userId: session.user.id,
      name: name.trim(),
      description: description || null,
      isPublic: isPublic ?? false,
    })
    .returning();

  return NextResponse.json(collection, { status: 201 });
}
