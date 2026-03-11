export interface DigestStats {
  discussions: number;
  newMembers: number;
  tasksCompleted: number;
  stories: number;
  unreadNotifications: number;
}

export interface EndeavorHighlight {
  title: string;
  id: string;
  newActivity: number;
}

export interface WeeklyDigestData {
  userName: string;
  stats: DigestStats;
  endeavorHighlights: EndeavorHighlight[];
}

export function weeklyDigestHtml(data: WeeklyDigestData): string {
  const { userName, stats, endeavorHighlights } = data;
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const totalActivity =
    stats.discussions +
    stats.newMembers +
    stats.tasksCompleted +
    stats.stories;

  const statRows = [
    { label: "New Discussions", value: stats.discussions },
    { label: "New Members", value: stats.newMembers },
    { label: "Tasks Completed", value: stats.tasksCompleted },
    { label: "Stories Published", value: stats.stories },
    { label: "Unread Notifications", value: stats.unreadNotifications },
  ];

  const statRowsHtml = statRows
    .map(
      (row) => `
      <tr>
        <td style="padding: 10px 16px; color: #ccc; font-size: 14px; border-bottom: 1px solid #222;">
          ${row.label}
        </td>
        <td style="padding: 10px 16px; color: #00FF00; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #222;">
          ${row.value}
        </td>
      </tr>`
    )
    .join("");

  const highlightsHtml =
    endeavorHighlights.length > 0
      ? `
      <div style="margin-top: 32px;">
        <h2 style="color: #fff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          Active Endeavors
        </h2>
        ${endeavorHighlights
          .map(
            (e) => `
          <a href="${baseUrl}/endeavors/${e.id}/dashboard" style="display: block; text-decoration: none; background: #1a1a1a; border: 1px solid #222; border-radius: 8px; padding: 14px 16px; margin-bottom: 8px;">
            <span style="color: #fff; font-size: 14px; font-weight: 500;">${e.title}</span>
            <span style="color: #00FF00; font-size: 13px; float: right;">${e.newActivity} new</span>
          </a>`
          )
          .join("")}
      </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Weekly Digest</title>
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
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; color: #fff; font-size: 18px; font-weight: 600;">
                Hi ${userName},
              </p>
              <p style="margin: 8px 0 0 0; color: #888; font-size: 14px; line-height: 1.5;">
                Here's what happened across your endeavors this week${totalActivity > 0 ? ` — ${totalActivity} total activities.` : "."}
              </p>
            </td>
          </tr>

          <!-- Stats Table -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a1a; border: 1px solid #222; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="padding: 14px 16px; border-bottom: 1px solid #333;">
                    <span style="color: #fff; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      This Week
                    </span>
                  </td>
                </tr>
                ${statRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Endeavor Highlights -->
          <tr>
            <td>
              ${highlightsHtml}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding-top: 32px;" align="center">
              <a href="${baseUrl}/dashboard" style="display: inline-block; background: #00FF00; color: #000; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
                View Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 40px; border-top: 1px solid #222; margin-top: 40px;">
              <p style="margin: 0; color: #555; font-size: 12px; line-height: 1.6; text-align: center;">
                You're receiving this because you're a member of active endeavors.
                <br />
                <a href="${baseUrl}/settings/notifications" style="color: #555; text-decoration: underline;">Unsubscribe from weekly digests</a>
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
