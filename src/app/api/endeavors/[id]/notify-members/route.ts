import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, notification, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { sendNotificationEmail } from "@/lib/email-notifications";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only the creator can broadcast notifications
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Endeavor not found" }, { status: 404 });
  }

  if (end.creatorId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the creator can notify members" },
      { status: 403 }
    );
  }

  const { subject, message } = await request.json();
  if (!subject || !message) {
    return NextResponse.json(
      { error: "subject and message are required" },
      { status: 400 }
    );
  }

  // Fetch all approved members (excluding the creator)
  const members = await db
    .select({ userId: member.userId })
    .from(member)
    .where(
      and(eq(member.endeavorId, id), eq(member.status, "approved"))
    );

  const recipients = members.filter((m) => m.userId !== session.user.id);

  if (recipients.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  // Insert in-app notification records
  await db.insert(notification).values(
    recipients.map((m) => ({
      userId: m.userId,
      type: "creator_announcement" as const,
      message: `${end.title}: ${subject} — ${message}`,
      endeavorId: id,
    }))
  );

  // Send email to each member (fire-and-forget, don't block response)
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const actionUrl = `${baseUrl}/endeavors/${id}/dashboard`;

  const emailPromises = recipients.map((m) =>
    sendNotificationEmail(m.userId, subject, message, {
      actionUrl,
      actionLabel: "View Endeavor",
    })
  );

  // Await all emails but don't fail the request if some fail
  await Promise.allSettled(emailPromises);

  return NextResponse.json({ notified: recipients.length });
}
