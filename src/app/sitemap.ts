import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app";

  const endeavors = await db
    .select({ id: endeavor.id, updatedAt: endeavor.updatedAt })
    .from(endeavor)
    .where(eq(endeavor.status, "open"))
    .orderBy(desc(endeavor.updatedAt))
    .limit(500);

  const endeavorUrls: MetadataRoute.Sitemap = endeavors.map((e) => ({
    url: `${baseUrl}/endeavors/${e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/endeavors/completed`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...endeavorUrls,
  ];
}
