import { db } from "@/lib/db";
import { endeavor, user, member } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app";

  const [end] = await db
    .select({
      title: endeavor.title,
      description: endeavor.description,
      category: endeavor.category,
      status: endeavor.status,
      location: endeavor.location,
      imageUrl: endeavor.imageUrl,
      creatorName: user.name,
      memberCount: sql<number>`(SELECT COUNT(*) FROM ${member} WHERE ${member.endeavorId} = ${endeavor.id} AND ${member.status} = 'approved')::int`,
    })
    .from(endeavor)
    .leftJoin(user, eq(endeavor.creatorId, user.id))
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return { title: "Not Found | Endeavor" };
  }

  const desc = end.description.length > 160
    ? end.description.slice(0, 157) + "..."
    : end.description;

  return {
    title: `${end.title} | Endeavor`,
    description: desc,
    openGraph: {
      title: end.title,
      description: desc,
      type: "article",
      url: `${baseUrl}/endeavors/${id}`,
      ...(end.imageUrl && { images: [{ url: end.imageUrl, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: end.imageUrl ? "summary_large_image" : "summary",
      title: end.title,
      description: desc,
      ...(end.imageUrl && { images: [end.imageUrl] }),
    },
    other: {
      "endeavor:category": end.category,
      "endeavor:status": end.status,
      "endeavor:members": String(end.memberCount),
      ...(end.location ? { "endeavor:location": end.location } : {}),
      ...(end.creatorName ? { "endeavor:creator": end.creatorName } : {}),
    },
  };
}

export default function EndeavorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
