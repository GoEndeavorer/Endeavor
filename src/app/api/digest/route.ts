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

// ── GET: public weekly digest for the digest page ──────────────────────────

export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    newEndeavorsCountResult,
    topNewEndeavorsResult,
    completedMilestonesResult,
    newMembersResult,
    mostActiveResult,
    topStoriesResult,
  ] = await Promise.all([
    // New endeavors created in the past 7 days
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM endeavor
      WHERE created_at >= ${sevenDaysAgo}::timestamp
    `),

    // Top 5 new endeavors by member count
    db.execute(sql`
      SELECT
        e.id,
        e.title,
        e.category,
        e.image_url AS "imageUrl",
        e.created_at AS "createdAt",
        COALESCE(mc.member_count, 0)::int AS "memberCount"
      FROM endeavor e
      LEFT JOIN (
        SELECT endeavor_id, COUNT(*)::int AS member_count
        FROM member
        WHERE status = 'approved'
        GROUP BY endeavor_id
      ) mc ON mc.endeavor_id = e.id
      WHERE e.created_at >= ${sevenDaysAgo}::timestamp
      ORDER BY mc.member_count DESC NULLS LAST, e.created_at DESC
      LIMIT 5
    `),

    // Completed milestones count
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM milestone
      WHERE completed = true
        AND completed_at >= ${sevenDaysAgo}::timestamp
    `),

    // New members joined the platform (users created in last 7 days)
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM "user"
      WHERE created_at >= ${sevenDaysAgo}::timestamp
    `),

    // Most active endeavors (by discussion + task activity)
    db.execute(sql`
      SELECT
        e.id,
        e.title,
        e.category,
        e.image_url AS "imageUrl",
        (
          (SELECT COUNT(*) FROM discussion d WHERE d.endeavor_id = e.id AND d.created_at >= ${sevenDaysAgo}::timestamp) +
          (SELECT COUNT(*) FROM task t WHERE t.endeavor_id = e.id AND t.created_at >= ${sevenDaysAgo}::timestamp)
        )::int AS "activityCount"
      FROM endeavor e
      WHERE e.status != 'completed'
      HAVING (
        (SELECT COUNT(*) FROM discussion d WHERE d.endeavor_id = e.id AND d.created_at >= ${sevenDaysAgo}::timestamp) +
        (SELECT COUNT(*) FROM task t WHERE t.endeavor_id = e.id AND t.created_at >= ${sevenDaysAgo}::timestamp)
      ) > 0
      ORDER BY "activityCount" DESC
      LIMIT 5
    `),

    // Top stories published
    db.execute(sql`
      SELECT
        s.id,
        s.title,
        s.created_at AS "createdAt",
        e.id AS "endeavorId",
        e.title AS "endeavorTitle",
        u.name AS "authorName"
      FROM story s
      INNER JOIN endeavor e ON e.id = s.endeavor_id
      INNER JOIN "user" u ON u.id = s.author_id
      WHERE s.published = true
        AND s.created_at >= ${sevenDaysAgo}::timestamp
      ORDER BY s.created_at DESC
      LIMIT 5
    `),
  ]);

  const newEndeavorsCount = (newEndeavorsCountResult.rows[0] as { count: number })?.count ?? 0;
  const completedMilestones = (completedMilestonesResult.rows[0] as { count: number })?.count ?? 0;
  const newMembers = (newMembersResult.rows[0] as { count: number })?.count ?? 0;

  const topNewEndeavors = topNewEndeavorsResult.rows as {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    createdAt: string;
    memberCount: number;
  }[];

  const mostActive = mostActiveResult.rows as {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    activityCount: number;
  }[];

  const topStories = topStoriesResult.rows as {
    id: string;
    title: string;
    createdAt: string;
    endeavorId: string;
    endeavorTitle: string;
    authorName: string;
  }[];

  return NextResponse.json({
    weekStart: sevenDaysAgo,
    weekEnd: new Date().toISOString(),
    newEndeavorsCount,
    topNewEndeavors,
    completedMilestones,
    newMembers,
    mostActive,
    topStories,
  });
}

// ── POST: send email digests (cron job) ────────────────────────────────────

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
