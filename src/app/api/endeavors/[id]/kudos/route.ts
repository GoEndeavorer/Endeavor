import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kudos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'great-work',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    SELECT k.*, s.name as sender_name, r.name as recipient_name
    FROM kudos k
    JOIN "user" s ON k.sender_id = s.id
    JOIN "user" r ON k.recipient_id = r.id
    WHERE k.endeavor_id = ${id}
    ORDER BY k.created_at DESC LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId, message, category } = await request.json();

  if (!recipientId || !message?.trim()) {
    return NextResponse.json({ error: "Recipient and message required" }, { status: 400 });
  }

  if (recipientId === session.user.id) {
    return NextResponse.json({ error: "Cannot give kudos to yourself" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kudos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'great-work',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO kudos (endeavor_id, sender_id, recipient_id, message, category)
    VALUES (${id}, ${session.user.id}, ${recipientId}, ${message.trim()}, ${category || "great-work"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
