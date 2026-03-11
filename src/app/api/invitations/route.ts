import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "received";

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS invitation (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id TEXT NOT NULL,
      recipient_id TEXT,
      recipient_email TEXT,
      endeavor_id UUID,
      group_id UUID,
      type TEXT NOT NULL DEFAULT 'endeavor',
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      responded_at TIMESTAMPTZ
    )
  `);

  let result;
  if (type === "sent") {
    result = await db.execute(sql`
      SELECT i.*, u.name as recipient_name, u.image as recipient_image,
        s.name as sender_name
      FROM invitation i
      LEFT JOIN "user" u ON i.recipient_id = u.id
      JOIN "user" s ON i.sender_id = s.id
      WHERE i.sender_id = ${session.user.id}
      ORDER BY i.created_at DESC LIMIT 50
    `);
  } else {
    result = await db.execute(sql`
      SELECT i.*, u.name as sender_name, u.image as sender_image
      FROM invitation i
      JOIN "user" u ON i.sender_id = u.id
      WHERE (i.recipient_id = ${session.user.id} OR i.recipient_email = ${session.user.email})
        AND i.status = 'pending'
      ORDER BY i.created_at DESC LIMIT 50
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId, recipientEmail, endeavorId, groupId, type, message } = await request.json();

  if (!recipientId && !recipientEmail) {
    return NextResponse.json({ error: "Recipient required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS invitation (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id TEXT NOT NULL,
      recipient_id TEXT,
      recipient_email TEXT,
      endeavor_id UUID,
      group_id UUID,
      type TEXT NOT NULL DEFAULT 'endeavor',
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      responded_at TIMESTAMPTZ
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO invitation (sender_id, recipient_id, recipient_email, endeavor_id, group_id, type, message)
    VALUES (${session.user.id}, ${recipientId || null}, ${recipientEmail || null}, ${endeavorId || null}, ${groupId || null}, ${type || "endeavor"}, ${message || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
