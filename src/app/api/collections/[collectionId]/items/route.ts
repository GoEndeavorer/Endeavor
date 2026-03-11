import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookmarkCollection, bookmarkItem } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST /api/collections/[collectionId]/items — add endeavor to collection
export async function POST(
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

  const { endeavorId, note } = await request.json();
  if (!endeavorId) {
    return NextResponse.json({ error: "endeavorId is required" }, { status: 400 });
  }

  // Check for duplicate
  const existing = await db
    .select({ id: bookmarkItem.id })
    .from(bookmarkItem)
    .where(
      and(
        eq(bookmarkItem.collectionId, collectionId),
        eq(bookmarkItem.endeavorId, endeavorId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Endeavor already in this collection" }, { status: 409 });
  }

  const [item] = await db
    .insert(bookmarkItem)
    .values({
      collectionId,
      endeavorId,
      note: note || null,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}

// DELETE /api/collections/[collectionId]/items — remove item from collection
export async function DELETE(
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

  const { itemId } = await request.json();
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  await db
    .delete(bookmarkItem)
    .where(
      and(
        eq(bookmarkItem.id, itemId),
        eq(bookmarkItem.collectionId, collectionId)
      )
    );

  return NextResponse.json({ deleted: true });
}
