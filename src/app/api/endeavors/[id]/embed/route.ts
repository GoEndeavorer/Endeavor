import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: return embeddable data for an endeavor (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.description,
      e.category,
      e.status,
      e.image_url,
      e.location,
      e.cost_per_person,
      e.funding_enabled,
      e.funding_goal,
      e.funding_raised,
      (SELECT COUNT(*) FROM member WHERE member.endeavor_id = e.id AND member.status = 'approved') as member_count,
      (SELECT COUNT(*) FROM task WHERE task.endeavor_id = e.id AND task.status = 'done') as tasks_done,
      (SELECT COUNT(*) FROM task WHERE task.endeavor_id = e.id) as tasks_total
    FROM endeavor e
    WHERE e.id = ${id}
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0], {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}
