import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST — batch mark notifications as read or delete
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, ids } = body; // action: "read" | "delete" | "read_all"

  if (action === "read_all") {
    await db
      .update(notification)
      .set({ read: true })
      .where(and(eq(notification.userId, session.user.id), eq(notification.read, false)));

    return NextResponse.json({ success: true });
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  if (action === "read") {
    await db
      .update(notification)
      .set({ read: true })
      .where(and(eq(notification.userId, session.user.id), inArray(notification.id, ids)));
  } else if (action === "delete") {
    await db
      .delete(notification)
      .where(and(eq(notification.userId, session.user.id), inArray(notification.id, ids)));
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
