import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS budget_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense',
      status TEXT NOT NULL DEFAULT 'planned',
      date TIMESTAMPTZ,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const items = await db.execute(sql`
    SELECT bi.*, u.name as created_by_name
    FROM budget_item bi
    JOIN "user" u ON bi.created_by = u.id
    WHERE bi.endeavor_id = ${id}
    ORDER BY bi.created_at DESC
  `);

  // Calculate summary
  const summary = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::decimal as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::decimal as total_expenses,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)::decimal as balance
    FROM budget_item
    WHERE endeavor_id = ${id}
  `);

  return NextResponse.json({
    items: items.rows,
    summary: summary.rows[0],
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, description, amount, type, status, date } = await request.json();

  if (!description?.trim() || amount === undefined) {
    return NextResponse.json({ error: "Description and amount required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS budget_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endeavor_id UUID NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense',
      status TEXT NOT NULL DEFAULT 'planned',
      date TIMESTAMPTZ,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO budget_item (endeavor_id, category, description, amount, type, status, date, created_by)
    VALUES (${id}, ${category || "general"}, ${description.trim()}, ${amount}, ${type || "expense"}, ${status || "planned"}, ${date || null}, ${session.user.id})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
