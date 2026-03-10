import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { notifyUser, notifyEndeavorMembers } from "@/lib/notifications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check endeavor exists and is open
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (end.status !== "open") {
    return NextResponse.json(
      { error: "This endeavor is not accepting new members" },
      { status: 400 }
    );
  }

  // Check if already a member
  const [existing] = await db
    .select()
    .from(member)
    .where(
      and(eq(member.endeavorId, id), eq(member.userId, session.user.id))
    )
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "You are already a member of this endeavor" },
      { status: 400 }
    );
  }

  // Check capacity
  if (end.capacity) {
    const result = await db
      .select({ endeavorId: member.endeavorId })
      .from(member)
      .where(
        and(eq(member.endeavorId, id), eq(member.status, "approved"))
      );
    if (result.length >= end.capacity) {
      return NextResponse.json(
        { error: "This endeavor is full" },
        { status: 400 }
      );
    }
  }

  const status = end.joinType === "open" ? "approved" : "pending";

  const [newMember] = await db
    .insert(member)
    .values({
      endeavorId: id,
      userId: session.user.id,
      role: "collaborator",
      status,
    })
    .returning();

  // Send notifications
  if (status === "approved") {
    await notifyEndeavorMembers(
      id,
      "member_joined",
      `${session.user.name} joined "${end.title}"`,
      session.user.id
    );
  } else {
    await notifyUser(
      end.creatorId,
      "join_request",
      `${session.user.name} requested to join "${end.title}"`,
      id
    );
  }

  return NextResponse.json(
    {
      ...newMember,
      message:
        status === "approved"
          ? "You have joined this endeavor!"
          : "Your request to join has been sent to the creator.",
    },
    { status: 201 }
  );
}
