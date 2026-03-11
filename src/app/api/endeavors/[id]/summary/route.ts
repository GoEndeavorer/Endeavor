import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - returns a text summary of an endeavor's progress
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.execute(sql`
    SELECT
      e.title,
      e.description,
      e.category,
      e.status,
      e.created_at,
      (SELECT COUNT(*) FROM member m WHERE m.endeavor_id = e.id AND m.status = 'approved') as members,
      (SELECT COUNT(*) FROM task t WHERE t.endeavor_id = e.id) as total_tasks,
      (SELECT COUNT(*) FROM task t WHERE t.endeavor_id = e.id AND t.status = 'completed') as completed_tasks,
      (SELECT COUNT(*) FROM milestone mi WHERE mi.endeavor_id = e.id) as total_milestones,
      (SELECT COUNT(*) FROM milestone mi WHERE mi.endeavor_id = e.id AND mi.completed = true) as completed_milestones,
      (SELECT COUNT(*) FROM discussion d WHERE d.endeavor_id = e.id) as discussions,
      (SELECT COUNT(*) FROM story s WHERE s.endeavor_id = e.id AND s.published = true) as stories,
      e.funding_enabled,
      e.funding_goal,
      e.funding_raised
    FROM endeavor e
    WHERE e.id = ${id}
    LIMIT 1
  `);

  const end = result.rows[0] as Record<string, unknown> | undefined;
  if (!end) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const totalTasks = Number(end.total_tasks);
  const completedTasks = Number(end.completed_tasks);
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMilestones = Number(end.total_milestones);
  const completedMilestones = Number(end.completed_milestones);
  const milestonePct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const lines = [
    `# ${end.title}`,
    `Category: ${end.category} | Status: ${end.status}`,
    ``,
    `${end.description}`,
    ``,
    `## Progress`,
    `- Members: ${end.members}`,
    `- Tasks: ${completedTasks}/${totalTasks} completed (${taskPct}%)`,
    `- Milestones: ${completedMilestones}/${totalMilestones} completed (${milestonePct}%)`,
    `- Discussions: ${end.discussions}`,
    `- Stories: ${end.stories}`,
  ];

  if (end.funding_enabled && end.funding_goal) {
    const fundingPct = Math.round((Number(end.funding_raised) / Number(end.funding_goal)) * 100);
    lines.push(`- Funding: $${Number(end.funding_raised).toLocaleString()} / $${Number(end.funding_goal).toLocaleString()} (${fundingPct}%)`);
  }

  lines.push(``, `Created: ${new Date(String(end.created_at)).toLocaleDateString()}`);

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain" },
  });
}
