import Link from "next/link";
import { MarkdownText } from "@/components/markdown-text";
import { db } from "@/lib/db";
import { story, user, endeavor } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [end] = await db
    .select({ title: endeavor.title })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) return { title: "Not Found" };
  return { title: `Stories — ${end.title} | Endeavor` };
}

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [end] = await db
    .select({ id: endeavor.id, title: endeavor.title })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) notFound();

  const stories = await db
    .select({
      id: story.id,
      title: story.title,
      content: story.content,
      createdAt: story.createdAt,
      authorName: user.name,
    })
    .from(story)
    .innerJoin(user, eq(story.authorId, user.id))
    .where(and(eq(story.endeavorId, id), eq(story.published, true)))
    .orderBy(desc(story.createdAt));

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">Endeavor</Link>
            <span className="text-medium-gray">/</span>
            <Link
              href={`/endeavors/${id}`}
              className="text-sm text-code-blue hover:text-code-green"
            >
              {end.title}
            </Link>
            <span className="text-medium-gray">/</span>
            <span className="text-sm text-medium-gray">Stories</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Stories</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Experiences and reflections from the crew behind{" "}
          <span className="text-code-blue">{end.title}</span>
        </p>

        {stories.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-sm text-medium-gray">
              No published stories yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {stories.map((s) => (
              <article
                key={s.id}
                className="border border-medium-gray/20 p-6"
              >
                <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
                <div className="mb-4 flex items-center gap-2 text-xs text-medium-gray">
                  <span>by {s.authorName}</span>
                  <span>&middot;</span>
                  <time>{new Date(s.createdAt).toLocaleDateString()}</time>
                </div>
                <MarkdownText content={s.content} />
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
