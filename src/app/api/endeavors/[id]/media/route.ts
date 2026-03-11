import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media, member, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list media for an endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const items = await db
    .select({
      id: media.id,
      url: media.url,
      fileName: media.fileName,
      fileType: media.fileType,
      fileSize: media.fileSize,
      caption: media.caption,
      createdAt: media.createdAt,
      uploadedById: user.id,
      uploadedByName: user.name,
    })
    .from(media)
    .innerJoin(user, eq(media.uploadedById, user.id))
    .where(eq(media.endeavorId, id))
    .orderBy(desc(media.createdAt));

  return NextResponse.json(items);
}

// POST — add media (members only, URL-based)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify membership
  const [mem] = await db
    .select()
    .from(member)
    .where(and(eq(member.endeavorId, id), eq(member.userId, session.user.id), eq(member.status, "approved")))
    .limit(1);

  if (!mem) {
    return NextResponse.json({ error: "Members only" }, { status: 403 });
  }

  const body = await request.json();
  const { url, fileName, fileType, fileSize, caption } = body;

  if (!url || !fileName || !fileType) {
    return NextResponse.json({ error: "url, fileName, and fileType required" }, { status: 400 });
  }

  const [item] = await db
    .insert(media)
    .values({
      endeavorId: id,
      uploadedById: session.user.id,
      url,
      fileName,
      fileType,
      fileSize: fileSize || null,
      caption: caption || null,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
