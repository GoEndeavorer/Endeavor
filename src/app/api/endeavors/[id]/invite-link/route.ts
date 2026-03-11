import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { invite, member } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

// GET — list active invite links for this endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const links = await db
    .select()
    .from(invite)
    .where(eq(invite.endeavorId, endeavorId))
    .orderBy(desc(invite.createdAt));

  return NextResponse.json(links);
}

// POST — generate a new invite link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify membership
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const maxUses = body.maxUses || null;
  const expiresInDays = body.expiresInDays || 7;

  const code = randomBytes(12).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const [created] = await db
    .insert(invite)
    .values({
      code,
      endeavorId,
      createdById: session.user.id,
      maxUses,
      expiresAt,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
