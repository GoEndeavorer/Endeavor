import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { notifyEndeavorMembers } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// POST — archive (soft-cancel) an endeavor
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can archive" }, { status: 403 });
  }

  if (end.status === "cancelled") {
    return NextResponse.json({ error: "Already archived" }, { status: 400 });
  }

  const [updated] = await db
    .update(endeavor)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(endeavor.id, id))
    .returning();

  await notifyEndeavorMembers(
    id,
    "status_change",
    `"${end.title}" has been archived by the creator`,
    session.user.id
  );

  return NextResponse.json(updated);
}
