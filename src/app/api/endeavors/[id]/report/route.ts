import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reason, details } = await request.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  const [newReport] = await db
    .insert(report)
    .values({
      reporterId: session.user.id,
      endeavorId: id,
      reason: reason.trim(),
      details: details?.trim() || null,
    })
    .returning();

  return NextResponse.json(newReport, { status: 201 });
}
