import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationId } = await params;

  await db
    .delete(notification)
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, session.user.id)
      )
    );

  return NextResponse.json({ success: true });
}
