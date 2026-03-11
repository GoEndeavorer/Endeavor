import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pinnedEndeavor, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: get pinned endeavors for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const session = await auth.api.getSession({ headers: await headers() });

  const targetUserId = userId || session?.user?.id;
  if (!targetUserId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const pinned = await db
    .select({
      id: pinnedEndeavor.id,
      endeavorId: pinnedEndeavor.endeavorId,
      sortOrder: pinnedEndeavor.sortOrder,
      title: endeavor.title,
      category: endeavor.category,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
    })
    .from(pinnedEndeavor)
    .innerJoin(endeavor, eq(pinnedEndeavor.endeavorId, endeavor.id))
    .where(eq(pinnedEndeavor.userId, targetUserId))
    .orderBy(pinnedEndeavor.sortOrder);

  return NextResponse.json(pinned);
}

// POST: pin an endeavor to profile (max 6)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endeavorId } = await request.json();
  if (!endeavorId) {
    return NextResponse.json({ error: "Endeavor ID required" }, { status: 400 });
  }

  // Check limit
  const existing = await db
    .select()
    .from(pinnedEndeavor)
    .where(eq(pinnedEndeavor.userId, session.user.id));

  if (existing.length >= 6) {
    return NextResponse.json({ error: "Maximum 6 pinned endeavors" }, { status: 400 });
  }

  // Check if already pinned
  if (existing.find((p) => p.endeavorId === endeavorId)) {
    return NextResponse.json({ error: "Already pinned" }, { status: 400 });
  }

  const [pinned] = await db
    .insert(pinnedEndeavor)
    .values({
      userId: session.user.id,
      endeavorId,
      sortOrder: existing.length,
    })
    .returning();

  return NextResponse.json(pinned);
}

// DELETE: unpin an endeavor
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endeavorId } = await request.json();

  await db
    .delete(pinnedEndeavor)
    .where(
      and(
        eq(pinnedEndeavor.userId, session.user.id),
        eq(pinnedEndeavor.endeavorId, endeavorId)
      )
    );

  return NextResponse.json({ success: true });
}
