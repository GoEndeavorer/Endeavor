import { db } from "@/lib/db";
import { endeavor, user } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app";

  const endeavors = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      description: endeavor.description,
      category: endeavor.category,
      status: endeavor.status,
      imageUrl: endeavor.imageUrl,
      createdAt: endeavor.createdAt,
      updatedAt: endeavor.updatedAt,
      creatorName: user.name,
    })
    .from(endeavor)
    .leftJoin(user, eq(endeavor.creatorId, user.id))
    .where(
      or(
        eq(endeavor.status, "open"),
        eq(endeavor.status, "in-progress"),
        eq(endeavor.status, "completed")
      )
    )
    .orderBy(desc(endeavor.createdAt))
    .limit(50);

  const lastUpdated = endeavors.length > 0
    ? new Date(endeavors[0].updatedAt).toISOString()
    : new Date().toISOString();

  const items = endeavors
    .map((e) => {
      const desc = e.description.length > 300
        ? e.description.slice(0, 297) + "..."
        : e.description;
      return `    <item>
      <title><![CDATA[${e.title}]]></title>
      <link>${baseUrl}/endeavors/${e.id}</link>
      <guid isPermaLink="true">${baseUrl}/endeavors/${e.id}</guid>
      <description><![CDATA[${desc}]]></description>
      <category>${e.category}</category>
      <pubDate>${new Date(e.createdAt).toUTCString()}</pubDate>
      ${e.creatorName ? `<author>${e.creatorName}</author>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Endeavor — New Endeavors</title>
    <link>${baseUrl}</link>
    <description>Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.</description>
    <language>en-us</language>
    <lastBuildDate>${lastUpdated}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
