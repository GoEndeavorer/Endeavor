import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { eq, desc, or } from "drizzle-orm";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app";

  // Include open and in-progress endeavors (not just open)
  const endeavors = await db
    .select({ id: endeavor.id, updatedAt: endeavor.updatedAt, status: endeavor.status })
    .from(endeavor)
    .where(or(
      eq(endeavor.status, "open"),
      eq(endeavor.status, "in-progress"),
      eq(endeavor.status, "completed"),
    ))
    .orderBy(desc(endeavor.updatedAt))
    .limit(1000);

  const endeavorUrls: MetadataRoute.Sitemap = endeavors.map((e) => ({
    url: `${baseUrl}/endeavors/${e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: e.status === "completed" ? "monthly" as const : "weekly" as const,
    priority: e.status === "open" ? 0.8 : e.status === "in-progress" ? 0.7 : 0.6,
  }));

  // Story pages for endeavors
  const storyUrls: MetadataRoute.Sitemap = endeavors
    .filter((e) => e.status === "completed")
    .map((e) => ({
      url: `${baseUrl}/endeavors/${e.id}/stories`,
      lastModified: e.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/endeavors/completed`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/activity`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...endeavorUrls,
    ...storyUrls,
  ];
}
