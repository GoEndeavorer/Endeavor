import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    INSERT INTO group_member (group_id, user_id, role)
    VALUES (${groupId}, ${session.user.id}, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING
  `);

  await db.execute(sql`
    UPDATE community_group SET member_count = (
      SELECT COUNT(*) FROM group_member WHERE group_id = ${groupId}
    ) WHERE id = ${groupId}
  `);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    DELETE FROM group_member WHERE group_id = ${groupId} AND user_id = ${session.user.id} AND role != 'admin'
  `);

  await db.execute(sql`
    UPDATE community_group SET member_count = (
      SELECT COUNT(*) FROM group_member WHERE group_id = ${groupId}
    ) WHERE id = ${groupId}
  `);

  return NextResponse.json({ ok: true });
}
