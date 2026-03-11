import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check membership: only creators/admins can generate invite links
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a deterministic invite code from the endeavor ID
  const code = crypto
    .createHash("sha256")
    .update(id + "endeavor-invite-salt")
    .digest("hex")
    .slice(0, 8);

  return NextResponse.json({
    code,
    url: `/invite/${code}?eid=${id}`,
  });
}
