import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payment, endeavor, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify user is creator of this endeavor
  const [end] = await db
    .select({ creatorId: endeavor.creatorId })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end || end.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only creator can view finances" }, { status: 403 });
  }

  const payments = await db
    .select({
      id: payment.id,
      userId: payment.userId,
      userName: user.name,
      type: payment.type,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
    })
    .from(payment)
    .innerJoin(user, eq(payment.userId, user.id))
    .where(eq(payment.endeavorId, id))
    .orderBy(sql`${payment.createdAt} DESC`);

  return NextResponse.json(payments);
}
