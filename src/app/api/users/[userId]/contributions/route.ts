import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const [
    endeavorsCreated,
    endeavorsJoined,
    tasksCompleted,
    discussionsPosts,
    storiesWritten,
    endorsementsGiven,
    milestonesCompleted,
  ] = await Promise.all([
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM endeavor
      WHERE creator_id = ${userId}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM member
      WHERE user_id = ${userId} AND status = 'approved'
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM task
      WHERE assignee_id = ${userId} AND task_status = 'done'
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM discussion
      WHERE author_id = ${userId}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM story
      WHERE author_id = ${userId} AND published = true
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM endorsement
      WHERE author_id = ${userId}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM milestone
      WHERE completed = true
        AND endeavor_id IN (
          SELECT endeavor_id FROM member
          WHERE user_id = ${userId} AND status = 'approved'
        )
    `),
  ]);

  return NextResponse.json({
    endeavorsCreated: (endeavorsCreated.rows[0] as { count: number }).count,
    endeavorsJoined: (endeavorsJoined.rows[0] as { count: number }).count,
    tasksCompleted: (tasksCompleted.rows[0] as { count: number }).count,
    discussionsPosts: (discussionsPosts.rows[0] as { count: number }).count,
    storiesWritten: (storiesWritten.rows[0] as { count: number }).count,
    endorsementsGiven: (endorsementsGiven.rows[0] as { count: number }).count,
    milestonesCompleted: (milestonesCompleted.rows[0] as { count: number }).count,
  });
}
