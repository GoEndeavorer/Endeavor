import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookmarkCollection, bookmarkItem, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/collections/[collectionId] — get collection details with items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const { collectionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const [collection] = await db
    .select()
    .from(bookmarkCollection)
    .where(eq(bookmarkCollection.id, collectionId))
    .limit(1);

  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the owner can view private collections
  if (!collection.isPublic && (!session || collection.userId !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select({
      id: bookmarkItem.id,
      endeavorId: bookmarkItem.endeavorId,
      note: bookmarkItem.note,
      createdAt: bookmarkItem.createdAt,
      title: endeavor.title,
      category: endeavor.category,
      imageUrl: endeavor.imageUrl,
      status: endeavor.status,
      description: endeavor.description,
    })
    .from(bookmarkItem)
    .innerJoin(endeavor, eq(bookmarkItem.endeavorId, endeavor.id))
    .where(eq(bookmarkItem.collectionId, collectionId))
    .orderBy(sql`${bookmarkItem.createdAt} DESC`);

  const isOwner = session ? collection.userId === session.user.id : false;

  return NextResponse.json({ ...collection, items, isOwner });
}

// PATCH /api/collections/[collectionId] — update collection (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const { collectionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [collection] = await db
    .select()
    .from(bookmarkCollection)
    .where(eq(bookmarkCollection.id, collectionId))
    .limit(1);

  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (collection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

  const [updated] = await db
    .update(bookmarkCollection)
    .set(updates)
    .where(eq(bookmarkCollection.id, collectionId))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/collections/[collectionId] — delete collection and items (owner only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const { collectionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [collection] = await db
    .select()
    .from(bookmarkCollection)
    .where(eq(bookmarkCollection.id, collectionId))
    .limit(1);

  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (collection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Items cascade-delete via FK, but delete explicitly to be safe
  await db.delete(bookmarkItem).where(eq(bookmarkItem.collectionId, collectionId));
  await db.delete(bookmarkCollection).where(eq(bookmarkCollection.id, collectionId));

  return NextResponse.json({ deleted: true });
}
