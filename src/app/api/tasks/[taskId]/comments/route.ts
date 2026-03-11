import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  // Ensure task_comment table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS task_comment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES "user"(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);

  const result = await db.execute(sql`
    SELECT
      tc.id,
      tc.content,
      tc.created_at as "createdAt",
      u.id as "authorId",
      u.name as "authorName",
      u.image as "authorImage"
    FROM task_comment tc
    JOIN "user" u ON u.id = tc.author_id
    WHERE tc.task_id = ${taskId}
    ORDER BY tc.created_at ASC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Ensure table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS task_comment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES "user"(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO task_comment (task_id, author_id, content)
    VALUES (${taskId}, ${session.user.id}, ${content.trim()})
    RETURNING id, content, created_at as "createdAt"
  `);

  const comment = result.rows[0] as { id: string; content: string; createdAt: string };

  return NextResponse.json({
    ...comment,
    authorId: session.user.id,
    authorName: session.user.name,
    authorImage: session.user.image,
  });
}
