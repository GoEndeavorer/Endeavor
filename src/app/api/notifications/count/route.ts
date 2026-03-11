import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  const result = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM notification
    WHERE user_id = ${session.user.id} AND read = false
  `);

  const count = Number((result.rows[0] as { count: number })?.count ?? 0);

  return NextResponse.json({ count });
}
