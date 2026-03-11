import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
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
      createdAt: endeavor.createdAt,
    })
    .from(endeavor)
    .where(
      or(eq(endeavor.status, "open"), eq(endeavor.status, "in-progress")),
    )
    .orderBy(desc(endeavor.createdAt))
    .limit(20);

  const items = endeavors
    .map((e) => {
      const truncated =
        e.description.length > 300
          ? e.description.slice(0, 297) + "..."
          : e.description;
      return `    <item>
      <title><![CDATA[${e.title}]]></title>
      <description><![CDATA[${truncated}]]></description>
      <link>${baseUrl}/endeavors/${e.id}</link>
      <guid isPermaLink="true">${baseUrl}/endeavors/${e.id}</guid>
      <pubDate>${new Date(e.createdAt).toUTCString()}</pubDate>
      <category>${e.category}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Endeavor \u2013 Latest Projects</title>
    <description>Discover the newest open and in-progress endeavors on the platform.</description>
    <link>${baseUrl}</link>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
