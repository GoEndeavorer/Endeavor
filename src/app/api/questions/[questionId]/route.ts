import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;

  const result = await db.execute(sql`
    SELECT q.*, u.name as author_name, u.image as author_image
    FROM question q
    JOIN "user" u ON q.author_id = u.id
    WHERE q.id = ${questionId}
  `);

  if (result.rows.length === 0) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
