import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ error: "ids parameter required" }, { status: 400 });
  }

  const idList = ids.split(",").slice(0, 4);
  if (idList.length < 2) {
    return NextResponse.json({ error: "At least 2 ids required" }, { status: 400 });
  }

  // Build parameterized IN clause
  const idParams = idList.map((id) => sql`${id}`);
  const inClause = sql.join(idParams, sql`, `);

  const result = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.description,
      e.category,
      e.status,
      e.location,
      e.location_type,
      e.cost_per_person,
      e.capacity,
      e.needs,
      e.image_url,
      e.funding_enabled,
      e.funding_goal,
      e.funding_raised,
      e.created_at,
      (SELECT COUNT(*) FROM member WHERE member.endeavor_id = e.id AND member.status = 'approved') as member_count,
      (SELECT COUNT(*) FROM task WHERE task.endeavor_id = e.id) as task_count,
      (SELECT COUNT(*) FROM task WHERE task.endeavor_id = e.id AND task.status = 'done') as tasks_completed,
      (SELECT COUNT(*) FROM discussion WHERE discussion.endeavor_id = e.id) as discussion_count,
      (SELECT COUNT(*) FROM milestone WHERE milestone.endeavor_id = e.id) as milestone_count,
      (SELECT COUNT(*) FROM milestone WHERE milestone.endeavor_id = e.id AND milestone.completed = true) as milestones_completed,
      (SELECT COUNT(*) FROM story WHERE story.endeavor_id = e.id AND story.published = true) as story_count
    FROM endeavor e
    WHERE e.id IN (${inClause})
  `);

  return NextResponse.json(result.rows);
}
