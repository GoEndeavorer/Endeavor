import Link from "next/link";
import { db } from "@/lib/db";
import { story, endeavor, user } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function FeaturedStories() {
  const stories = await db
    .select({
      id: story.id,
      title: story.title,
      content: story.content,
      createdAt: story.createdAt,
      authorName: user.name,
      endeavorTitle: endeavor.title,
      endeavorId: endeavor.id,
    })
    .from(story)
    .innerJoin(user, eq(story.authorId, user.id))
    .innerJoin(endeavor, eq(story.endeavorId, endeavor.id))
    .where(eq(story.published, true))
    .orderBy(desc(story.createdAt))
    .limit(3);

  if (stories.length === 0) return null;

  return (
    <section className="border-t border-medium-gray/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// from the field"}
        </h2>
        <p className="mb-10 text-center text-2xl font-bold md:text-3xl">
          Stories from real endeavors
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {stories.map((s) => (
            <Link
              key={s.id}
              href={`/stories/${s.id}`}
              className="group border border-medium-gray/20 p-6 transition-colors hover:border-code-green/50"
            >
              <p className="mb-3 text-xs text-code-blue">
                {s.endeavorTitle}
              </p>
              <h3 className="mb-2 font-semibold group-hover:text-code-green transition-colors">
                {s.title}
              </h3>
              <p className="mb-4 text-sm text-medium-gray leading-relaxed line-clamp-3">
                {s.content.slice(0, 150)}
                {s.content.length > 150 ? "..." : ""}
              </p>
              <p className="text-xs text-medium-gray">
                by {s.authorName}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/stories"
            className="text-sm text-medium-gray hover:text-code-green transition-colors"
          >
            Read all stories &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
