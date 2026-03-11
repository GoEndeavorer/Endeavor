import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { name, email, type, message } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // Send via Resend if configured
  if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@endeavor.app",
        to: process.env.CONTACT_EMAIL,
        subject: `[Endeavor ${type}] from ${name || "Anonymous"}`,
        text: `Type: ${type}\nFrom: ${name || "Anonymous"} (${email || "no email"})\n\n${message}`,
      });
    } catch (err) {
      console.error("Failed to send contact email:", err);
    }
  }

  // Always return success (don't leak whether email was sent)
  return NextResponse.json({ success: true });
}
