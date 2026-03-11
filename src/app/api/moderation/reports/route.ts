import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_report (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      resolved_by TEXT,
      resolution_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `);

  // Return user's own reports
  const result = await db.execute(sql`
    SELECT * FROM content_report
    WHERE reporter_id = ${session.user.id}
    ORDER BY created_at DESC LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetType, targetId, reason, details } = await request.json();

  if (!targetType || !targetId || !reason) {
    return NextResponse.json({ error: "Target type, ID, and reason are required" }, { status: 400 });
  }

  const validReasons = ["spam", "harassment", "inappropriate", "copyright", "misinformation", "other"];
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS content_report (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      resolved_by TEXT,
      resolution_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO content_report (reporter_id, target_type, target_id, reason, details)
    VALUES (${session.user.id}, ${targetType}, ${targetId}, ${reason}, ${details || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
