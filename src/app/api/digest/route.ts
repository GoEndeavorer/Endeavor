import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Resend } from "resend";
import {
  weeklyDigestHtml,
  type DigestStats,
  type EndeavorHighlight,
} from "@/lib/email-templates/weekly-digest";

export const dynamic = "force-dynamic";

const FROM = process.env.EMAIL_FROM || "Endeavor <digest@endeavor.app>";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all users who have at least one approved membership
  const usersResult = await db.execute(sql`
    SELECT DISTINCT u.id, u.name, u.email
    FROM "user" u
    INNER JOIN member m ON m.user_id = u.id AND m.status = 'approved'
  `);

  const users = usersResult.rows as {
    id: string;
    name: string;
    email: string;
  }[];

  let sent = 0;
  let skipped = 0;

  for (const u of users) {
    // Get endeavor IDs this user belongs to (as member or creator)
    const endeavorIdsResult = await db.execute(sql`
      SELECT DISTINCT eid FROM (
        SELECT m.endeavor_id AS eid
        FROM member m
        WHERE m.user_id = ${u.id} AND m.status = 'approved'
        UNION
        SELECT e.id AS eid
        FROM endeavor e
        WHERE e.creator_id = ${u.id}
      ) sub
    `);

    const endeavorIds = (endeavorIdsResult.rows as { eid: string }[]).map(
      (r) => r.eid
    );

    if (endeavorIds.length === 0) {
      skipped++;
      continue;
    }

    // Fetch all stats in parallel
    const [
      discussionsResult,
      newMembersResult,
      tasksCompletedResult,
      storiesResult,
      unreadResult,
      highlightsResult,
    ] = await Promise.all([
      // New discussions count
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM discussion
        WHERE endeavor_id = ANY(${endeavorIds})
          AND created_at >= ${sevenDaysAgo.toISOString()}::timestamp
      `),
      // New members count
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM member
        WHERE endeavor_id = ANY(${endeavorIds})
          AND status = 'approved'
          AND joined_at >= ${sevenDaysAgo.toISOString()}::timestamp
          AND user_id != ${u.id}
      `),
      // Tasks completed count
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM task
        WHERE endeavor_id = ANY(${endeavorIds})
          AND task_status = 'done'
          AND updated_at >= ${sevenDaysAgo.toISOString()}::timestamp
      `),
      // Stories published count
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM story
        WHERE endeavor_id = ANY(${endeavorIds})
          AND published = true
          AND created_at >= ${sevenDaysAgo.toISOString()}::timestamp
      `),
      // Unread notifications count
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM notification
        WHERE user_id = ${u.id}
          AND read = false
      `),
      // Per-endeavor activity highlights
      db.execute(sql`
        SELECT
          e.id,
          e.title,
          (
            (SELECT COUNT(*) FROM discussion d WHERE d.endeavor_id = e.id AND d.created_at >= ${sevenDaysAgo.toISOString()}::timestamp) +
            (SELECT COUNT(*) FROM member m2 WHERE m2.endeavor_id = e.id AND m2.status = 'approved' AND m2.joined_at >= ${sevenDaysAgo.toISOString()}::timestamp AND m2.user_id != ${u.id}) +
            (SELECT COUNT(*) FROM task t WHERE t.endeavor_id = e.id AND t.task_status = 'done' AND t.updated_at >= ${sevenDaysAgo.toISOString()}::timestamp) +
            (SELECT COUNT(*) FROM story s WHERE s.endeavor_id = e.id AND s.published = true AND s.created_at >= ${sevenDaysAgo.toISOString()}::timestamp)
          )::int AS new_activity
        FROM endeavor e
        WHERE e.id = ANY(${endeavorIds})
        HAVING (
          (SELECT COUNT(*) FROM discussion d WHERE d.endeavor_id = e.id AND d.created_at >= ${sevenDaysAgo.toISOString()}::timestamp) +
          (SELECT COUNT(*) FROM member m2 WHERE m2.endeavor_id = e.id AND m2.status = 'approved' AND m2.joined_at >= ${sevenDaysAgo.toISOString()}::timestamp AND m2.user_id != ${u.id}) +
          (SELECT COUNT(*) FROM task t WHERE t.endeavor_id = e.id AND t.task_status = 'done' AND t.updated_at >= ${sevenDaysAgo.toISOString()}::timestamp) +
          (SELECT COUNT(*) FROM story s WHERE s.endeavor_id = e.id AND s.published = true AND s.created_at >= ${sevenDaysAgo.toISOString()}::timestamp)
        ) > 0
        ORDER BY new_activity DESC
        LIMIT 5
      `),
    ]);

    const stats: DigestStats = {
      discussions: (discussionsResult.rows[0] as { count: number })?.count ?? 0,
      newMembers: (newMembersResult.rows[0] as { count: number })?.count ?? 0,
      tasksCompleted:
        (tasksCompletedResult.rows[0] as { count: number })?.count ?? 0,
      stories: (storiesResult.rows[0] as { count: number })?.count ?? 0,
      unreadNotifications:
        (unreadResult.rows[0] as { count: number })?.count ?? 0,
    };

    const totalActivity =
      stats.discussions +
      stats.newMembers +
      stats.tasksCompleted +
      stats.stories;

    // Skip users with zero activity across all categories
    if (totalActivity === 0 && stats.unreadNotifications === 0) {
      skipped++;
      continue;
    }

    const endeavorHighlights: EndeavorHighlight[] = (
      highlightsResult.rows as { id: string; title: string; new_activity: number }[]
    ).map((row) => ({
      title: row.title,
      id: row.id,
      newActivity: row.new_activity,
    }));

    const html = weeklyDigestHtml({
      userName: u.name,
      stats,
      endeavorHighlights,
    });

    try {
      await resend.emails.send({
        from: FROM,
        to: u.email,
        subject: `Your weekly digest — ${totalActivity} new activities`,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send digest to ${u.email}:`, err);
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped });
}
