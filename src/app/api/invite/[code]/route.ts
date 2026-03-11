import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invite, endeavor, member, user } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — get invite info (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const result = await db
    .select({
      endeavorId: endeavor.id,
      endeavorTitle: endeavor.title,
      endeavorCategory: endeavor.category,
      endeavorImage: endeavor.imageUrl,
      inviterName: user.name,
      inviteMaxUses: invite.maxUses,
      inviteUses: invite.uses,
      inviteExpiresAt: invite.expiresAt,
      memberCount: sql<number>`(
        SELECT COUNT(*) FROM member
        WHERE member.endeavor_id = ${endeavor.id}
        AND member.status = 'approved'
      )`,
    })
    .from(invite)
    .innerJoin(endeavor, eq(invite.endeavorId, endeavor.id))
    .innerJoin(user, eq(invite.createdById, user.id))
    .where(eq(invite.code, code))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  const inv = result[0];

  // Check expiration
  if (inv.inviteExpiresAt && new Date(inv.inviteExpiresAt) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  // Check max uses
  if (inv.inviteMaxUses && inv.inviteUses >= inv.inviteMaxUses) {
    return NextResponse.json({ error: "Invite fully used" }, { status: 410 });
  }

  return NextResponse.json({
    endeavorId: inv.endeavorId,
    endeavorTitle: inv.endeavorTitle,
    endeavorCategory: inv.endeavorCategory,
    endeavorImage: inv.endeavorImage,
    inviterName: inv.inviterName,
    memberCount: Number(inv.memberCount),
  });
}
