import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Calculate overall project progress from tasks and milestones
  const [tasks, milestones, checklist] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)::int as completed
      FROM task WHERE endeavor_id = ${id}
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int as total,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END)::int as completed
      FROM milestone WHERE endeavor_id = ${id}
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int as total,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END)::int as completed
      FROM endeavor_checklist WHERE endeavor_id = ${id}
    `),
  ]);

  const taskData = tasks.rows[0] as { total: number; completed: number };
  const milestoneData = milestones.rows[0] as { total: number; completed: number };
  const checklistData = checklist.rows[0] as { total: number; completed: number };

  // Weighted progress: tasks (50%), milestones (30%), checklist (20%)
  let totalWeight = 0;
  let completedWeight = 0;

  if (taskData.total > 0) {
    totalWeight += 50;
    completedWeight += 50 * ((taskData.completed || 0) / taskData.total);
  }
  if (milestoneData.total > 0) {
    totalWeight += 30;
    completedWeight += 30 * ((milestoneData.completed || 0) / milestoneData.total);
  }
  if (checklistData.total > 0) {
    totalWeight += 20;
    completedWeight += 20 * ((checklistData.completed || 0) / checklistData.total);
  }

  const overallProgress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  return NextResponse.json({
    overall: overallProgress,
    tasks: { total: taskData.total, completed: taskData.completed || 0 },
    milestones: { total: milestoneData.total, completed: milestoneData.completed || 0 },
    checklist: { total: checklistData.total, completed: checklistData.completed || 0 },
  });
}
