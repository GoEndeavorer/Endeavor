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
  const action = searchParams.get("action");
  const limit = Math.min(100, Number(searchParams.get("limit")) || 50);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      metadata JSONB DEFAULT '{}',
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let result;
  if (action) {
    result = await db.execute(sql`
      SELECT al.*, u.name as user_name, u.image as user_image
      FROM audit_log al
      JOIN "user" u ON al.user_id = u.id
      WHERE al.user_id = ${session.user.id} AND al.action = ${action}
      ORDER BY al.created_at DESC LIMIT ${limit}
    `);
  } else {
    result = await db.execute(sql`
      SELECT al.*, u.name as user_name, u.image as user_image
      FROM audit_log al
      JOIN "user" u ON al.user_id = u.id
      WHERE al.user_id = ${session.user.id}
      ORDER BY al.created_at DESC LIMIT ${limit}
    `);
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, entityType, entityId, metadata } = await request.json();

  if (!action) {
    return NextResponse.json({ error: "Action required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      metadata JSONB DEFAULT '{}',
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
    VALUES (${session.user.id}, ${action}, ${entityType || null}, ${entityId || null}, ${JSON.stringify(metadata || {})})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
