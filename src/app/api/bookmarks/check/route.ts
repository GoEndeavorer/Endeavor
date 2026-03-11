import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookmark } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

// GET /api/bookmarks/check?endeavorId=xxx
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ bookmarked: false });
  }

  const endeavorId = request.nextUrl.searchParams.get("endeavorId");
  if (!endeavorId) {
    return NextResponse.json({ bookmarked: false });
  }

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

  return NextResponse.json({ bookmarked: existing.length > 0 });
}
