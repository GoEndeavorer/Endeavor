import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";
import { sendInviteEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await sendInviteEmail(email.trim(), session.user.name, end.title, id);

  return NextResponse.json({ message: "Invite sent!" });
}
