import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { inviteLink, endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: list invite links for this endeavor (creator only)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [end] = await db
    .select({ creatorId: endeavor.creatorId })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const links = await db
    .select()
    .from(inviteLink)
    .where(eq(inviteLink.endeavorId, id))
    .orderBy(inviteLink.createdAt);

  return NextResponse.json(links);
}

// POST: create a new invite link (creator only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [membership] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(member.endeavorId, id),
        eq(member.status, "approved"),
        eq(member.role, "creator")
      )
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json({ error: "Only creators can generate invite links" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const code = crypto.randomBytes(8).toString("hex");

  const [link] = await db
    .insert(inviteLink)
    .values({
      endeavorId: id,
      code,
      createdById: session.user.id,
      maxUses: body.maxUses || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    })
    .returning();

  return NextResponse.json({
    ...link,
    url: `/invite/${code}`,
  });
}

// DELETE: revoke an invite link (creator only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { linkId } = await request.json();

  const [end] = await db
    .select({ creatorId: endeavor.creatorId })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .delete(inviteLink)
    .where(and(eq(inviteLink.id, linkId), eq(inviteLink.endeavorId, id)));

  return NextResponse.json({ success: true });
}
