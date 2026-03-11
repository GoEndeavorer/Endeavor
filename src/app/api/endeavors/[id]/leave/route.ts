import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { notifyEndeavorMembers } from "@/lib/notifications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Creator cannot leave their own endeavor
  if (end.creatorId === session.user.id) {
    return NextResponse.json(
      { error: "Creators cannot leave their own endeavor. Delete it instead." },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(member)
    .where(
      and(eq(member.endeavorId, id), eq(member.userId, session.user.id))
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: "You are not a member of this endeavor" },
      { status: 400 }
    );
  }

  await db
    .delete(member)
    .where(
      and(eq(member.endeavorId, id), eq(member.userId, session.user.id))
    );

  await notifyEndeavorMembers(
    id,
    "member_left",
    `${session.user.name} left "${end.title}"`,
    session.user.id
  );

  return NextResponse.json({ message: "You have left this endeavor." });
}
