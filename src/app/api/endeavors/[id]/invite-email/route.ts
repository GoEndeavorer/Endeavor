import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { member, endeavor, inviteLink } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: endeavorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  const body = await request.json().catch(() => null);
  if (!body || !body.email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const { email, message: personalMessage } = body as {
    email: string;
    message?: string;
  };

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  // Verify the sender is a creator or collaborator of the endeavor
  const membership = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json(
      { error: "Only creators and collaborators can send invites" },
      { status: 403 }
    );
  }

  // Fetch endeavor details
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, endeavorId))
    .limit(1);

  if (!end) {
    return NextResponse.json(
      { error: "Endeavor not found" },
      { status: 404 }
    );
  }

  // Generate an invite link
  const code = randomBytes(12).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [created] = await db
    .insert(inviteLink)
    .values({
      code,
      endeavorId,
      createdById: session.user.id,
      maxUses: 1,
      expiresAt,
    })
    .returning();

  // Build the invite URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://endeavor.vercel.app";
  const inviteUrl = `${baseUrl}/invite/${created.code}`;

  // Send email via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL || "noreply@endeavor.vercel.app";
  const inviterName = session.user.name || "A member";

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${inviterName} invited you to join "${end.title}" on Endeavor`,
      html: `
        <div style="font-family: monospace; background: #0a0a0a; color: #ccc; padding: 32px; max-width: 560px;">
          <h2 style="color: #00FF00; margin-top: 0;">You're Invited</h2>
          <p><strong style="color: #fff;">${inviterName}</strong> has invited you to join <strong style="color: #00A1D6;">${end.title}</strong> on Endeavor.</p>
          ${personalMessage ? `<div style="border-left: 2px solid #666; padding-left: 12px; margin: 16px 0; color: #aaa;">${personalMessage}</div>` : ""}
          <a href="${inviteUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #00FF00; color: #000; text-decoration: none; font-weight: bold;">Join Endeavor</a>
          <p style="margin-top: 24px; font-size: 12px; color: #666;">This invite link expires in 7 days.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    inviteCode: created.code,
  });
}
