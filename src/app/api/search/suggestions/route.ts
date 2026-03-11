import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    const popular = await db.execute(sql`
      SELECT DISTINCT unnest(needs) as term
      FROM endeavor
      WHERE needs IS NOT NULL AND status IN ('open', 'in-progress')
      LIMIT 10
    `);

    return NextResponse.json({
      suggestions: popular.rows.map((r) => (r as { term: string }).term),
    });
  }

  // Typed suggestions for search dropdown
  const [endeavorResults, userResults, categoryResults] = await Promise.all([
    db.execute(sql`
      SELECT id, title, category FROM endeavor
      WHERE title ILIKE ${'%' + q + '%'} AND status IN ('open', 'in-progress')
      ORDER BY created_at DESC
      LIMIT 4
    `),
    db.execute(sql`
      SELECT id, name, bio FROM "user"
      WHERE name ILIKE ${'%' + q + '%'}
      LIMIT 3
    `),
    db.execute(sql`
      SELECT DISTINCT category as title FROM endeavor
      WHERE category ILIKE ${'%' + q + '%'} AND status IN ('open', 'in-progress')
      LIMIT 2
    `),
  ]);

  const typed = [
    ...(endeavorResults.rows as { id: string; title: string; category: string }[]).map((r) => ({
      type: "endeavor" as const,
      id: r.id,
      title: r.title,
      subtitle: r.category,
    })),
    ...(userResults.rows as { id: string; name: string; bio: string | null }[]).map((r) => ({
      type: "user" as const,
      id: r.id,
      title: r.name,
      subtitle: r.bio?.slice(0, 60) || undefined,
    })),
    ...(categoryResults.rows as { title: string }[]).map((r) => ({
      type: "category" as const,
      id: r.title,
      title: r.title,
    })),
  ];

  // Also return flat suggestions for backwards compatibility
  const suggestions = typed.map((t) => t.title);

  return NextResponse.json(typed.length > 0 ? typed : { suggestions });
}
