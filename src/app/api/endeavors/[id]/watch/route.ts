import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - check if user is watching this endeavor
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ watching: false });
  }

  const result = await db.execute(sql`
    SELECT 1 FROM saved_endeavor
    WHERE user_id = ${session.user.id} AND endeavor_id = ${id}
    LIMIT 1
  `);

  return NextResponse.json({ watching: result.rows.length > 0 });
}

// POST - toggle watch status
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check current status
  const existing = await db.execute(sql`
    SELECT id FROM saved_endeavor
    WHERE user_id = ${session.user.id} AND endeavor_id = ${id}
    LIMIT 1
  `);

  if (existing.rows.length > 0) {
    // Unwatch
    await db.execute(sql`
      DELETE FROM saved_endeavor
      WHERE user_id = ${session.user.id} AND endeavor_id = ${id}
    `);
    return NextResponse.json({ watching: false });
  } else {
    // Watch
    await db.execute(sql`
      INSERT INTO saved_endeavor (user_id, endeavor_id)
      VALUES (${session.user.id}, ${id})
      ON CONFLICT DO NOTHING
    `);
    return NextResponse.json({ watching: true });
  }
}
