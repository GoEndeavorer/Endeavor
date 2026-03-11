import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { directMessage } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  const [result] = await db
    .select({ count: count() })
    .from(directMessage)
    .where(
      and(
        eq(directMessage.recipientId, session.user.id),
        eq(directMessage.read, false)
      )
    );

  return NextResponse.json({ count: result.count });
}
