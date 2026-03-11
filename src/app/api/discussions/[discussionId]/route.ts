import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discussion } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const { discussionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(discussion)
    .where(eq(discussion.id, discussionId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can delete" }, { status: 403 });
  }

  await db.delete(discussion).where(eq(discussion.id, discussionId));
  return NextResponse.json({ success: true });
}
