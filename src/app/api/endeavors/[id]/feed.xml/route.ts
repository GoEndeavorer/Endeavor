import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc2822(date: string | Date): string {
  return new Date(date).toUTCString();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const baseUrl =
    process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app";

  // Get endeavor info
  const endeavorResult = await db.execute(sql`
    SELECT id, title, tagline, created_at
    FROM endeavor
    WHERE id = ${id}
    LIMIT 1
  `);

  const endeavor = endeavorResult.rows[0] as
    | { id: string; title: string; tagline: string | null; created_at: string }
    | undefined;

  if (!endeavor) {
    return NextResponse.json({ error: "Endeavor not found" }, { status: 404 });
  }

  // Fetch recent items from discussions, milestones, updates, and stories
  const itemsResult = await db.execute(sql`
    (
      SELECT
        'discussion' AS type,
        d.id AS item_id,
        LEFT(d.content, 100) AS title,
        d.content AS description,
        d.created_at,
        u.name AS author_name
      FROM discussion d
      INNER JOIN "user" u ON d.author_id = u.id
      WHERE d.endeavor_id = ${id}
      ORDER BY d.created_at DESC
      LIMIT 20
    )
    UNION ALL
    (
      SELECT
        'milestone' AS type,
        m.id AS item_id,
        m.title,
        COALESCE(m.description, 'Milestone completed') AS description,
        m.created_at,
        NULL AS author_name
      FROM milestone m
      WHERE m.endeavor_id = ${id}
      ORDER BY m.created_at DESC
      LIMIT 20
    )
    UNION ALL
    (
      SELECT
        'update' AS type,
        up.id AS item_id,
        up.title,
        up.content AS description,
        up.created_at,
        u.name AS author_name
      FROM "update" up
      INNER JOIN "user" u ON up.author_id = u.id
      WHERE up.endeavor_id = ${id}
      ORDER BY up.created_at DESC
      LIMIT 20
    )
    UNION ALL
    (
      SELECT
        'story' AS type,
        s.id AS item_id,
        s.title,
        LEFT(s.content, 300) AS description,
        s.created_at,
        u.name AS author_name
      FROM story s
      INNER JOIN "user" u ON s.author_id = u.id
      WHERE s.endeavor_id = ${id} AND s.published = true
      ORDER BY s.created_at DESC
      LIMIT 20
    )
    ORDER BY created_at DESC
    LIMIT 20
  `);

  const items = itemsResult.rows as Array<{
    type: string;
    item_id: string;
    title: string;
    description: string;
    created_at: string;
    author_name: string | null;
  }>;

  const endeavorUrl = `${baseUrl}/endeavors/${endeavor.id}`;

  const itemsXml = items
    .map((item) => {
      let link: string;
      if (item.type === "story") {
        link = `${baseUrl}/stories/${item.item_id}`;
      } else {
        link = `${endeavorUrl}`;
      }

      const typeLabel =
        item.type === "discussion"
          ? "Discussion"
          : item.type === "milestone"
            ? "Milestone"
            : item.type === "update"
              ? "Update"
              : "Story";

      const titleText = item.author_name
        ? `[${typeLabel}] ${item.title} — by ${item.author_name}`
        : `[${typeLabel}] ${item.title}`;

      return `    <item>
      <title>${escapeXml(titleText)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${toRfc2822(item.created_at)}</pubDate>
      <guid isPermaLink="false">${item.type}-${item.item_id}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(endeavor.title)} — Endeavor Feed</title>
    <link>${escapeXml(endeavorUrl)}</link>
    <description>${escapeXml(endeavor.tagline || `Latest activity from ${endeavor.title}`)}</description>
    <language>en-us</language>
    <lastBuildDate>${toRfc2822(new Date())}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
