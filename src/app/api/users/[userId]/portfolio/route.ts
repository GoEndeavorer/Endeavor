import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET — returns a user's portfolio: published stories, completed endeavors, top contributions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const [publishedStories, completedEndeavors, topContributions] =
    await Promise.all([
      // Published stories
      db.execute(sql`
        SELECT
          s.id,
          s.title,
          s.created_at AS "createdAt",
          en.id AS "endeavorId",
          en.title AS "endeavorTitle"
        FROM story s
        INNER JOIN endeavor en ON s.endeavor_id = en.id
        WHERE s.author_id = ${userId} AND s.published = true
        ORDER BY s.created_at DESC
        LIMIT 20
      `),

      // Completed endeavors the user is a member of (or created)
      db.execute(sql`
        SELECT DISTINCT
          en.id,
          en.title,
          en.category,
          en.image_url AS "imageUrl",
          en.status
        FROM endeavor en
        LEFT JOIN member m ON m.endeavor_id = en.id AND m.user_id = ${userId} AND m.status = 'approved'
        WHERE en.status = 'completed'
          AND (en.creator_id = ${userId} OR m.id IS NOT NULL)
        ORDER BY en.title
        LIMIT 20
      `),

      // Top contributions: tasks completed, grouped by endeavor
      db.execute(sql`
        SELECT
          en.id AS "endeavorId",
          en.title AS "endeavorTitle",
          COUNT(*)::int AS "tasksCompleted"
        FROM task t
        INNER JOIN endeavor en ON t.endeavor_id = en.id
        WHERE t.assignee_id = ${userId} AND t.task_status = 'done'
        GROUP BY en.id, en.title
        ORDER BY "tasksCompleted" DESC
        LIMIT 10
      `),
    ]);

  return NextResponse.json({
    publishedStories: publishedStories.rows,
    completedEndeavors: completedEndeavors.rows,
    topContributions: topContributions.rows,
  });
}
