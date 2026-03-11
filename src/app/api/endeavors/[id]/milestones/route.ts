import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { milestone } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const milestones = await db
    .select()
    .from(milestone)
    .where(eq(milestone.endeavorId, id));

  return NextResponse.json(milestones);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, targetDate } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const [m] = await db
    .insert(milestone)
    .values({
      endeavorId: id,
      title: title.trim(),
      description: description?.trim() || null,
      targetDate: targetDate ? new Date(targetDate) : null,
    })
    .returning();

  return NextResponse.json(m, { status: 201 });
}
