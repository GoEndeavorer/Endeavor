import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "Endeavor <noreply@endeavor.app>";

export async function sendPaymentConfirmation(
  to: string,
  name: string,
  endeavorTitle: string,
  amount: number,
  type: "join" | "donation"
) {
  const subject =
    type === "join"
      ? `You've joined: ${endeavorTitle}`
      : `Thanks for funding: ${endeavorTitle}`;

  const body =
    type === "join"
      ? `Hi ${name},\n\nYou've successfully joined "${endeavorTitle}".\n\nAmount paid: $${(amount / 100).toFixed(2)}\n\nHead to your dashboard to start collaborating with your crew.\n\n— Endeavor`
      : `Hi ${name},\n\nThanks for your $${(amount / 100).toFixed(2)} contribution to "${endeavorTitle}".\n\nYour support helps make this endeavor happen.\n\n— Endeavor`;

  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject,
      text: body,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export async function sendJoinNotification(
  to: string,
  name: string,
  joinerName: string,
  endeavorTitle: string,
  isPending: boolean
) {
  const subject = isPending
    ? `Join request: ${joinerName} wants to join "${endeavorTitle}"`
    : `${joinerName} joined "${endeavorTitle}"`;

  const body = isPending
    ? `Hi ${name},\n\n${joinerName} has requested to join your endeavor "${endeavorTitle}".\n\nLog in to approve or decline the request.\n\n— Endeavor`
    : `Hi ${name},\n\n${joinerName} has joined your endeavor "${endeavorTitle}".\n\nYour crew is growing!\n\n— Endeavor`;

  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject,
      text: body,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  endeavorTitle: string,
  endeavorId: string
) {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/endeavors/${endeavorId}`;

  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `${inviterName} invited you to join "${endeavorTitle}" on Endeavor`,
      text: `Hi,\n\n${inviterName} invited you to join their endeavor: "${endeavorTitle}".\n\nCheck it out: ${link}\n\n— Endeavor`,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }
}
