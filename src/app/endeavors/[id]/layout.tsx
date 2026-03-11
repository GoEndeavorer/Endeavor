import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const [end] = await db
    .select({ title: endeavor.title, description: endeavor.description, category: endeavor.category })
    .from(endeavor)
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
      type: "website",
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
