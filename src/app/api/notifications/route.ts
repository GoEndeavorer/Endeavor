import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, session.user.id))
    .orderBy(desc(notification.createdAt))
    .limit(50);

  return NextResponse.json(notifications);
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, markAllRead } = await request.json();

  if (markAllRead) {
    await db
      .update(notification)
      .set({ read: true })
      .where(
        and(
          eq(notification.userId, session.user.id),
          eq(notification.read, false)
        )
      );
    return NextResponse.json({ success: true });
  }

  if (id) {
    await db
      .update(notification)
      .set({ read: true })
      .where(
        and(eq(notification.id, id), eq(notification.userId, session.user.id))
      );
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
