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

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "Welcome to Endeavor!",
      text: `Hi ${name},\n\nWelcome to Endeavor — the platform where you post what you want to do and find people who want to do it with you.\n\nHere's how to get started:\n\n1. Browse endeavors at /feed and find something that interests you\n2. Or create your own endeavor and invite collaborators\n3. Fill out your profile with skills and interests for better recommendations\n\nLet's make something happen.\n\n— Endeavor`,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
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

export async function sendTaskAssignmentEmail(
  to: string,
  assigneeName: string,
  assignerName: string,
  taskTitle: string,
  endeavorTitle: string,
  endeavorId: string
) {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/endeavors/${endeavorId}/dashboard`;

  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `New task assigned: ${taskTitle}`,
      text: `Hi ${assigneeName},\n\n${assignerName} assigned you a task in "${endeavorTitle}":\n\n"${taskTitle}"\n\nView your dashboard: ${link}\n\n— Endeavor`,
    });
  } catch (err) {
    console.error("Failed to send task assignment email:", err);
  }
}
