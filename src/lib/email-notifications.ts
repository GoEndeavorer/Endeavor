import { Resend } from "resend";
import { db } from "./db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";
import {
  notificationEmailHtml,
  type NotificationEmailData,
} from "./email-templates/notification";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "Endeavor <noreply@endeavor.app>";

/**
 * Fetch a user's email and name, send them a styled HTML notification email.
 * Fails silently on missing API key or send errors (logs to console).
 */
export async function sendNotificationEmail(
  userId: string,
  subject: string,
  body: string,
  options?: { actionUrl?: string; actionLabel?: string }
) {
  try {
    const resend = getResend();
    if (!resend) return;

    const [recipient] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!recipient) {
      console.error(`sendNotificationEmail: user ${userId} not found`);
      return;
    }

    const templateData: NotificationEmailData = {
      userName: recipient.name,
      title: subject,
      message: body,
      actionUrl: options?.actionUrl,
      actionLabel: options?.actionLabel,
    };

    await resend.emails.send({
      from: FROM,
      to: recipient.email,
      subject,
      html: notificationEmailHtml(templateData),
    });
  } catch (err) {
    console.error("Failed to send notification email:", err);
  }
}
