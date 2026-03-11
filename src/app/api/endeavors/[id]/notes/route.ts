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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Personal notes scoped to an endeavor
  const result = await db.execute(sql`
    SELECT * FROM user_note
    WHERE user_id = ${session.user.id} AND endeavor_id = ${id}
    ORDER BY pinned DESC, updated_at DESC
  `);

  return NextResponse.json(result.rows);
}
