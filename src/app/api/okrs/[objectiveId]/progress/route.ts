import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
  const { objectiveId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { keyResultId, currentValue } = await request.json();
  if (!keyResultId || currentValue === undefined) {
    return NextResponse.json({ error: "keyResultId and currentValue required" }, { status: 400 });
  }

  // Verify key result belongs to this objective
  const krCheck = await db.execute(sql`
    SELECT id, target_value FROM okr_key_result
    WHERE id = ${keyResultId} AND objective_id = ${objectiveId}
  `);
  if (krCheck.rows.length === 0) {
    return NextResponse.json({ error: "Key result not found" }, { status: 404 });
  }

  // Determine status based on progress
  const target = Number((krCheck.rows[0] as { target_value: number }).target_value);
  const current = Number(currentValue);
  let status = "in-progress";
  if (current <= 0) status = "not-started";
  else if (current >= target) status = "completed";

  // Update key result
  await db.execute(sql`
    UPDATE okr_key_result
    SET current_value = ${currentValue}, status = ${status}
    WHERE id = ${keyResultId}
  `);

  // Recalculate objective progress as average of key results
  const avgResult = await db.execute(sql`
    SELECT COALESCE(
      ROUND(AVG(
        CASE WHEN target_value > 0 THEN (current_value / target_value) * 100 ELSE 0 END
      )),
      0
    ) as avg_progress
    FROM okr_key_result
    WHERE objective_id = ${objectiveId}
  `);
  const avgProgress = Math.min(100, Number((avgResult.rows[0] as { avg_progress: number }).avg_progress));

  // Update objective progress and status
  const objStatus = avgProgress >= 100 ? "completed" : avgProgress > 0 ? "active" : "active";
  await db.execute(sql`
    UPDATE okr_objective
    SET progress = ${avgProgress}, status = ${objStatus}
    WHERE id = ${objectiveId}
  `);

  return NextResponse.json({ progress: avgProgress, keyResultStatus: status });
}
