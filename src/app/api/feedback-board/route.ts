import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endeavorId = searchParams.get("endeavorId");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") || "votes";

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'feature',
      status TEXT NOT NULL DEFAULT 'open',
      vote_count INT NOT NULL DEFAULT 0,
      comment_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let whereClause = "WHERE 1=1";
  if (endeavorId) whereClause += ` AND fi.endeavor_id = '${endeavorId.replace(/'/g, "''")}'`;
  if (status && status !== "all") whereClause += ` AND fi.status = '${status.replace(/'/g, "''")}'`;

  const orderBy = sort === "newest" ? "fi.created_at DESC" : "fi.vote_count DESC, fi.created_at DESC";

  const result = await db.execute(
    sql.raw(`
      SELECT fi.*, u.name as author_name
      FROM feedback_item fi
      JOIN "user" u ON fi.author_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT 50
    `)
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, type, endeavorId } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id TEXT NOT NULL,
      endeavor_id UUID,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'feature',
      status TEXT NOT NULL DEFAULT 'open',
      vote_count INT NOT NULL DEFAULT 0,
      comment_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const validTypes = ["feature", "bug", "improvement", "question"];
  const result = await db.execute(sql`
    INSERT INTO feedback_item (author_id, endeavor_id, title, description, type)
    VALUES (${session.user.id}, ${endeavorId || null}, ${title.trim()}, ${description || null}, ${validTypes.includes(type) ? type : "feature"})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
