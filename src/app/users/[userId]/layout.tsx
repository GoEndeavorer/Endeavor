import type { Metadata } from "next";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ userId: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;

  const [profile] = await db
    .select({
      name: user.name,
      bio: user.bio,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!profile) {
    return { title: "User Not Found | Endeavor" };
  }

  const desc = profile.bio
    ? profile.bio.length > 160
      ? profile.bio.slice(0, 157) + "..."
      : profile.bio
    : `${profile.name}'s profile on Endeavor`;

  return {
    title: `${profile.name} | Endeavor`,
    description: desc,
    openGraph: {
      title: `${profile.name} on Endeavor`,
      description: desc,
      type: "profile",
    },
  };
}

export default function UserLayout({ children }: Props) {
  return children;
}
