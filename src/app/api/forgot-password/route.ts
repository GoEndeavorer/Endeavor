import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, verification } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import crypto from "crypto";

const FROM = process.env.EMAIL_FROM || "Endeavor <noreply@endeavor.app>";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({
    message: "If an account exists with that email, a reset link has been sent.",
  });

  const [existingUser] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1);

  if (!existingUser) {
    return successResponse;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: `password-reset:${email.toLowerCase()}`,
    value: token,
    expiresAt,
  });

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Reset your Endeavor password",
      text: `Hi ${existingUser.name},\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\n— Endeavor`,
    });
  } catch (err) {
    console.error("Failed to send reset email:", err);
  }

  return successResponse;
}
