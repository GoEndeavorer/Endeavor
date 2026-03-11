export interface NotificationEmailData {
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function notificationEmailHtml(data: NotificationEmailData): string {
  const { userName, title, message, actionUrl, actionLabel } = data;
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const ctaHtml = actionUrl
    ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding-top: 28px;" align="center">
              <a href="${actionUrl}" style="display: inline-block; background: #00FF00; color: #000; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
                ${actionLabel || "View Details"}
              </a>
            </td>
          </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #111; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #111;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #00FF00; letter-spacing: -0.5px;">
                Endeavor
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="margin: 0; color: #fff; font-size: 18px; font-weight: 600;">
                Hi ${userName},
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; color: #00FF00; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${title}
              </h2>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td>
              <div style="background: #1a1a1a; border: 1px solid #222; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #ccc; font-size: 14px; line-height: 1.6; white-space: pre-line;">
                  ${message}
                </p>
              </div>
            </td>
          </tr>

          ${ctaHtml}

          <!-- Footer -->
          <tr>
            <td style="padding-top: 40px; border-top: 1px solid #222; margin-top: 40px;">
              <p style="margin: 0; color: #555; font-size: 12px; line-height: 1.6; text-align: center;">
                You're receiving this because you're a member of an endeavor on Endeavor.
                <br />
                <a href="${baseUrl}/settings/notifications" style="color: #555; text-decoration: underline;">Manage notification preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
