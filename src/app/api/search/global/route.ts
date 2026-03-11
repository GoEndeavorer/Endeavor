import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q?.trim()) return NextResponse.json({ results: [] });

  const searchTerm = `%${q.trim()}%`;

  // Search across multiple entity types
  const [endeavors, stories, users, forums, snippets] = await Promise.all([
    db.execute(sql`
      SELECT id, title, description, 'endeavor' as type, "createdAt" as created_at
      FROM endeavor
      WHERE title ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
      ORDER BY "createdAt" DESC LIMIT 5
    `),
    db.execute(sql`
      SELECT id, title, NULL as description, 'story' as type, "createdAt" as created_at
      FROM story
      WHERE title ILIKE ${searchTerm} AND published = true
      ORDER BY "createdAt" DESC LIMIT 5
    `),
    db.execute(sql`
      SELECT id, name as title, email as description, 'user' as type, "createdAt" as created_at
      FROM "user"
      WHERE name ILIKE ${searchTerm} OR email ILIKE ${searchTerm}
      ORDER BY "createdAt" DESC LIMIT 5
    `),
    db.execute(sql`
      SELECT id, name as title, description, 'forum' as type, created_at
      FROM forum
      WHERE name ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
      ORDER BY created_at DESC LIMIT 3
    `).catch(() => ({ rows: [] })),
    db.execute(sql`
      SELECT id, COALESCE(title, 'Untitled') as title, description, 'snippet' as type, created_at
      FROM code_snippet
      WHERE title ILIKE ${searchTerm} OR code ILIKE ${searchTerm}
      ORDER BY created_at DESC LIMIT 3
    `).catch(() => ({ rows: [] })),
  ]);

  const results = [
    ...endeavors.rows.map((r) => ({ ...r, type: "endeavor" })),
    ...stories.rows.map((r) => ({ ...r, type: "story" })),
    ...users.rows.map((r) => ({ ...r, type: "user" })),
    ...forums.rows.map((r) => ({ ...r, type: "forum" })),
    ...snippets.rows.map((r) => ({ ...r, type: "snippet" })),
  ];

  return NextResponse.json({
    results,
    total: results.length,
    query: q.trim(),
  });
}
