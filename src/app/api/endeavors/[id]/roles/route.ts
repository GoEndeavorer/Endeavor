import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// PATCH - update a member's role (creator only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify creator
  const creatorCheck = await db.execute(sql`
    SELECT 1 FROM endeavor WHERE id = ${id} AND creator_id = ${session.user.id}
    LIMIT 1
  `);
  if (creatorCheck.rows.length === 0) {
    return NextResponse.json({ error: "Only the creator can manage roles" }, { status: 403 });
  }

  const { memberId, role } = await request.json();
  if (!memberId || !role) {
    return NextResponse.json({ error: "memberId and role are required" }, { status: 400 });
  }

  const validRoles = ["member", "moderator", "admin"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `Role must be one of: ${validRoles.join(", ")}` }, { status: 400 });
  }

  // Don't allow changing own role
  const memberCheck = await db.execute(sql`
    SELECT user_id FROM member WHERE id = ${memberId} AND endeavor_id = ${id}
    LIMIT 1
  `);
  if (memberCheck.rows.length === 0) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  const memberRow = memberCheck.rows[0] as { user_id: string };
  if (memberRow.user_id === session.user.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  await db.execute(sql`
    UPDATE member SET role = ${role}
    WHERE id = ${memberId} AND endeavor_id = ${id}
  `);

  return NextResponse.json({ success: true, role });
}
