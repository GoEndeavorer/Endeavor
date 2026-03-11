import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.execute(sql`
    SELECT
      e.title,
      e.category,
      e.status,
      e.description,
      (SELECT COUNT(*) FROM member WHERE member.endeavor_id = e.id AND member.status = 'approved') as members,
      (SELECT COUNT(*) FROM task WHERE task.endeavor_id = e.id) as total_tasks,
      (SELECT COUNT(*) FROM task WHERE task.endeavor_id = e.id AND task.status = 'done') as done_tasks,
      (SELECT COUNT(*) FROM milestone WHERE milestone.endeavor_id = e.id AND milestone.completed = true) as milestones_done,
      (SELECT COUNT(*) FROM milestone WHERE milestone.endeavor_id = e.id) as total_milestones,
      (SELECT COUNT(*) FROM discussion WHERE discussion.endeavor_id = e.id) as discussions,
      (SELECT COUNT(*) FROM story WHERE story.endeavor_id = e.id AND story.published = true) as stories
    FROM endeavor e
    WHERE e.id = ${id}
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const e = result.rows[0] as Record<string, unknown>;
  const baseUrl = process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app";

  const taskPct = Number(e.total_tasks) > 0
    ? Math.round((Number(e.done_tasks) / Number(e.total_tasks)) * 100)
    : 0;

  // Generate shareable text
  const lines = [
    `${e.title} — ${e.category}`,
    `Status: ${e.status}`,
    `${e.members} members`,
  ];

  if (Number(e.total_tasks) > 0) {
    lines.push(`Tasks: ${e.done_tasks}/${e.total_tasks} completed (${taskPct}%)`);
  }
  if (Number(e.total_milestones) > 0) {
    lines.push(`Milestones: ${e.milestones_done}/${e.total_milestones}`);
  }
  if (Number(e.discussions) > 0) {
    lines.push(`${e.discussions} discussions`);
  }
  if (Number(e.stories) > 0) {
    lines.push(`${e.stories} stories published`);
  }

  lines.push("", `Join us: ${baseUrl}/endeavors/${id}`);

  return NextResponse.json({
    text: lines.join("\n"),
    stats: {
      members: Number(e.members),
      tasksDone: Number(e.done_tasks),
      tasksTotal: Number(e.total_tasks),
      taskPct,
      milestonesDone: Number(e.milestones_done),
      milestonesTotal: Number(e.total_milestones),
      discussions: Number(e.discussions),
      stories: Number(e.stories),
    },
    url: `${baseUrl}/endeavors/${id}`,
  });
}
