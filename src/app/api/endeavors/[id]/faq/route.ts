import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faq, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — list FAQ items for an endeavor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const items = await db
    .select()
    .from(faq)
    .where(eq(faq.endeavorId, id))
    .orderBy(asc(faq.sortOrder), asc(faq.createdAt));

  return NextResponse.json(items);
}

// POST — add FAQ item (creator/admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check creator/admin
  const [membership] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(member.endeavorId, id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (!membership || membership.role !== "creator") {
    return NextResponse.json({ error: "Only creators can manage FAQ" }, { status: 403 });
  }

  const body = await request.json();
  const { question, answer } = body;

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "Question and answer required" }, { status: 400 });
  }

  const [item] = await db
    .insert(faq)
    .values({
      endeavorId: id,
      question: question.trim(),
      answer: answer.trim(),
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}

// DELETE — remove FAQ item (creator only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { faqId } = await request.json();

  if (!faqId) {
    return NextResponse.json({ error: "faqId required" }, { status: 400 });
  }

  // Check creator
  const [membership] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(member.endeavorId, id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (!membership || membership.role !== "creator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(faq).where(and(eq(faq.id, faqId), eq(faq.endeavorId, id)));

  return NextResponse.json({ success: true });
}
