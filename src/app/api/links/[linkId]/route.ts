import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { link } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(link)
    .where(eq(link.id, linkId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await isMemberOf(existing.endeavorId, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(link).where(eq(link.id, linkId));
  return NextResponse.json({ success: true });
}
