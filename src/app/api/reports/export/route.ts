import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "endeavors";
  const format = searchParams.get("format") || "json";

  let data: Record<string, unknown>[] = [];

  if (type === "endeavors") {
    const result = await db.execute(sql`
      SELECT e.id, e.title, e.description, e.category, e.status, e."createdAt", e."updatedAt",
        (SELECT COUNT(*) FROM endeavor_member em WHERE em.endeavor_id = e.id) as member_count
      FROM endeavor e
      WHERE e."creatorId" = ${session.user.id}
      ORDER BY e."createdAt" DESC
    `);
    data = result.rows as Record<string, unknown>[];
  } else if (type === "tasks") {
    const result = await db.execute(sql`
      SELECT t.id, t.title, t.description, t.status, t.priority, t.created_at, t.due_date,
        e.title as endeavor_title
      FROM task t
      LEFT JOIN endeavor e ON t.endeavor_id = e.id
      WHERE t.assignee_id = ${session.user.id} OR t.creator_id = ${session.user.id}
      ORDER BY t.created_at DESC
    `);
    data = result.rows as Record<string, unknown>[];
  } else if (type === "time") {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS time_entry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        endeavor_id UUID,
        task_id UUID,
        description TEXT,
        duration_minutes INT NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const result = await db.execute(sql`
      SELECT te.id, te.description, te.duration_minutes, te.date,
        e.title as endeavor_title
      FROM time_entry te
      LEFT JOIN endeavor e ON te.endeavor_id = e.id
      WHERE te.user_id = ${session.user.id}
      ORDER BY te.date DESC
    `);
    data = result.rows as Record<string, unknown>[];
  }

  if (format === "csv") {
    if (data.length === 0) {
      return new NextResponse("No data", { headers: { "Content-Type": "text/csv" } });
    }
    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(","),
      ...data.map((row) => keys.map((k) => {
        const val = row[k];
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(","))
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${type}-export.csv`,
      },
    });
  }

  return NextResponse.json({ data, count: data.length });
}
