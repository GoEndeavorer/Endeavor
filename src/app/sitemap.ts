import { db } from "@/lib/db";
import { endeavor, story } from "@/lib/db/schema";
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

  // Get published stories for individual story pages
  const publishedStories = await db
    .select({ id: story.id, updatedAt: story.updatedAt })
    .from(story)
    .where(eq(story.published, true))
    .orderBy(desc(story.updatedAt))
    .limit(500);

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
    { url: `${baseUrl}/hiring`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/people`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/stories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/discover`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/tags`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/stats`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/needs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/templates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/archived`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
    { url: `${baseUrl}/digest`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/onboarding`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/achievements`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/activity-log`, lastModified: new Date(), changeFrequency: "daily", priority: 0.4 },
    { url: `${baseUrl}/api-docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    ...endeavorUrls,
    ...storyUrls,
    ...publishedStories.map((s) => ({
      url: `${baseUrl}/stories/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
