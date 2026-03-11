import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { invite, endeavor, member, notification } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST — accept an invite and join the endeavor
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the invite
  const [inv] = await db
    .select()
    .from(invite)
    .where(eq(invite.code, code))
    .limit(1);

  if (!inv) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  if (inv.maxUses && inv.uses >= inv.maxUses) {
    return NextResponse.json({ error: "Invite fully used" }, { status: 410 });
  }

  // Check if already a member
  const existing = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, inv.endeavorId),
        eq(member.userId, session.user.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({
      endeavorId: inv.endeavorId,
      message: "Already a member",
    });
  }

  // Get endeavor info
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, inv.endeavorId))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Endeavor not found" }, { status: 404 });
  }

  // Join directly as approved (invite bypasses request flow)
  await db.insert(member).values({
    endeavorId: inv.endeavorId,
    userId: session.user.id,
    role: "collaborator",
    status: "approved",
  });

  // Increment invite use count
  await db
    .update(invite)
    .set({ uses: sql`${invite.uses} + 1` })
    .where(eq(invite.id, inv.id));

  // Notify creator
  await db.insert(notification).values({
    userId: end.creatorId,
    type: "member_joined",
    message: `${session.user.name} joined "${end.title}" via invite link`,
    endeavorId: inv.endeavorId,
  });

  return NextResponse.json({ endeavorId: inv.endeavorId });
}
