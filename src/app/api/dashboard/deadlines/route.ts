import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json([]);
  }

  const userId = session.user.id;

  // Get upcoming tasks and milestones from user's endeavors
  const result = await db.execute(sql`
    (
      SELECT
        t.id,
        t.title,
        'task' as type,
        t.due_date as due_date,
        t.endeavor_id,
        e.title as endeavor_title
      FROM task t
      JOIN endeavor e ON t.endeavor_id = e.id
      JOIN member m ON m.endeavor_id = e.id AND m.user_id = ${userId} AND m.status = 'approved'
      WHERE t.due_date IS NOT NULL
        AND t.status != 'completed'
        AND t.due_date >= NOW() - INTERVAL '7 days'
      ORDER BY t.due_date ASC
      LIMIT 5
    )
    UNION ALL
    (
      SELECT
        mi.id,
        mi.title,
        'milestone' as type,
        mi.target_date as due_date,
        mi.endeavor_id,
        e.title as endeavor_title
      FROM milestone mi
      JOIN endeavor e ON mi.endeavor_id = e.id
      JOIN member m ON m.endeavor_id = e.id AND m.user_id = ${userId} AND m.status = 'approved'
      WHERE mi.target_date IS NOT NULL
        AND mi.completed = false
        AND mi.target_date >= NOW() - INTERVAL '7 days'
      ORDER BY mi.target_date ASC
      LIMIT 5
    )
    ORDER BY due_date ASC
    LIMIT 10
  `);

  return NextResponse.json(
    (result.rows as {
      id: string;
      title: string;
      type: string;
      due_date: string;
      endeavor_id: string;
      endeavor_title: string;
    }[]).map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      dueDate: r.due_date,
      endeavorId: r.endeavor_id,
      endeavorTitle: r.endeavor_title,
    }))
  );
}
