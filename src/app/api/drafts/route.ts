import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/drafts — list user's draft endeavors
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drafts = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      category: endeavor.category,
      description: endeavor.description,
      imageUrl: endeavor.imageUrl,
      status: endeavor.status,
      createdAt: endeavor.createdAt,
      updatedAt: endeavor.updatedAt,
    })
    .from(endeavor)
    .where(
      and(
        eq(endeavor.creatorId, session.user.id),
        eq(endeavor.status, "draft")
      )
    )
    .orderBy(endeavor.updatedAt);

  return NextResponse.json(drafts);
}

// DELETE /api/drafts — delete a specific draft by id
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Verify ownership and draft status
  const [existing] = await db
    .select({ id: endeavor.id, creatorId: endeavor.creatorId, status: endeavor.status })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can delete" }, { status: 403 });
  }

  if (existing.status !== "draft") {
    return NextResponse.json({ error: "Only drafts can be deleted from this endpoint" }, { status: 400 });
  }

  await db.delete(endeavor).where(eq(endeavor.id, id));

  return NextResponse.json({ success: true });
}
