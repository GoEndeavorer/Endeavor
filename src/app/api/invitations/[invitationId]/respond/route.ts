import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const { invitationId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await request.json();

  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Verify recipient
  const inv = await db.execute(sql`
    SELECT * FROM invitation WHERE id = ${invitationId}
    AND (recipient_id = ${session.user.id} OR recipient_email = ${session.user.email})
    AND status = 'pending'
  `);

  if (inv.rows.length === 0) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  await db.execute(sql`
    UPDATE invitation SET status = ${action === "accept" ? "accepted" : "declined"}, responded_at = NOW()
    WHERE id = ${invitationId}
  `);

  // If accepted, join the endeavor or group
  if (action === "accept") {
    const invitation = inv.rows[0] as { endeavor_id: string | null; group_id: string | null; type: string };
    if (invitation.endeavor_id) {
      await db.execute(sql`
        INSERT INTO endeavor_member (endeavor_id, user_id, role)
        VALUES (${invitation.endeavor_id}, ${session.user.id}, 'collaborator')
        ON CONFLICT DO NOTHING
      `);
    }
    if (invitation.group_id) {
      await db.execute(sql`
        INSERT INTO group_member (group_id, user_id, role)
        VALUES (${invitation.group_id}, ${session.user.id}, 'member')
        ON CONFLICT (group_id, user_id) DO NOTHING
      `);
    }
  }

  return NextResponse.json({ ok: true, status: action === "accept" ? "accepted" : "declined" });
}
