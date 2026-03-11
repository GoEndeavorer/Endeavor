import { db } from "@/lib/db";
import { story, user, endeavor } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownText } from "@/components/markdown-text";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { StoryComments } from "@/components/story-comments";
import { estimateReadingTime } from "@/lib/reading-time";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ storyId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storyId } = await params;

  const [s] = await db
    .select({
      title: story.title,
      content: story.content,
      authorName: user.name,
      endeavorTitle: endeavor.title,
    })
    .from(story)
    .innerJoin(user, eq(story.authorId, user.id))
    .innerJoin(endeavor, eq(story.endeavorId, endeavor.id))
    .where(and(eq(story.id, storyId), eq(story.published, true)))
    .limit(1);

  if (!s) return { title: "Story Not Found | Endeavor" };

  const desc = s.content.length > 160 ? s.content.slice(0, 157) + "..." : s.content;

  return {
    title: `${s.title} | Endeavor`,
    description: desc,
    openGraph: {
      title: s.title,
      description: desc,
      type: "article",
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { storyId } = await params;

  const [s] = await db
    .select({
      id: story.id,
      title: story.title,
      content: story.content,
      createdAt: story.createdAt,
      authorId: story.authorId,
      authorName: user.name,
      endeavorId: story.endeavorId,
      endeavorTitle: endeavor.title,
      endeavorCategory: endeavor.category,
    })
    .from(story)
    .innerJoin(user, eq(story.authorId, user.id))
    .innerJoin(endeavor, eq(story.endeavorId, endeavor.id))
    .where(and(eq(story.id, storyId), eq(story.published, true)))
    .limit(1);

  if (!s) notFound();

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{
          label: s.endeavorTitle,
          href: `/endeavors/${s.endeavorId}`,
        }}
      />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <article>
          <header className="mb-8 border-b border-medium-gray/20 pb-8">
            <p className="mb-3 text-xs uppercase tracking-widest text-code-green">
              Story
            </p>
            <h1 className="mb-4 text-3xl font-bold leading-tight">{s.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-medium-gray">
              <Link
                href={`/users/${s.authorId}`}
                className="text-code-blue hover:text-code-green"
              >
                {s.authorName}
              </Link>
              <span>&middot;</span>
              <time>{new Date(s.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</time>
              <span>&middot;</span>
              <span>{estimateReadingTime(s.content)} min read</span>
              <span>&middot;</span>
              <Link
                href={`/endeavors/${s.endeavorId}`}
                className="text-code-blue hover:text-code-green"
              >
                {s.endeavorTitle}
              </Link>
              <span className="border border-medium-gray/30 px-1.5 py-0.5 text-xs">
                {s.endeavorCategory}
              </span>
            </div>
          </header>

          <div className="prose-custom">
            <MarkdownText content={s.content} />
          </div>
        </article>

        <div className="mt-12 border-t border-medium-gray/20 pt-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/endeavors/${s.endeavorId}`}
              className="border border-medium-gray/30 px-4 py-2 text-sm text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
            >
              View Endeavor
            </Link>
            <Link
              href={`/endeavors/${s.endeavorId}/stories`}
              className="border border-medium-gray/30 px-4 py-2 text-sm text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
            >
              More Stories
            </Link>
          </div>
        </div>

        <StoryComments storyId={storyId} />
      </main>
      <Footer />
    </div>
  );
}
