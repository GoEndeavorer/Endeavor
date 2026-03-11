import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, member, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, sql, eq } from "drizzle-orm";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      endeavorCount: sql<number>`(
        SELECT COUNT(DISTINCT ${member.endeavorId})
        FROM ${member}
        WHERE ${member.userId} = ${user.id} AND ${member.status} = 'approved'
      )::int`,
      createdCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${endeavor}
        WHERE ${endeavor.creatorId} = ${user.id}
      )::int`,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(100);

  return NextResponse.json(users);
}
