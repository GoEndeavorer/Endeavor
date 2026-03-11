import { db } from "@/lib/db";
import { story, user, endeavor } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories | Endeavor",
  description:
    "Read stories from people who turned ideas into reality on Endeavor.",
};

export default async function StoriesIndexPage() {
  const stories = await db
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
      endeavorImage: endeavor.imageUrl,
    })
    .from(story)
    .innerJoin(user, eq(story.authorId, user.id))
    .innerJoin(endeavor, eq(story.endeavorId, endeavor.id))
    .where(eq(story.published, true))
    .orderBy(desc(story.createdAt))
    .limit(50);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Stories", href: "/stories" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Stories</h1>
        <p className="mb-8 text-sm text-medium-gray">
          First-hand experiences from people who turned ideas into reality
        </p>

        {stories.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-2 text-medium-gray">No stories yet</p>
            <p className="text-sm text-medium-gray/60">
              Stories are written by members of completed endeavors
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((s) => {
              const excerpt =
                s.content.length > 200
                  ? s.content.slice(0, 197) + "..."
                  : s.content;
              return (
                <Link
                  key={s.id}
                  href={`/stories/${s.id}`}
                  className="group block border border-medium-gray/20 transition-colors hover:border-code-green/50"
                >
                  <div className="flex">
                    {s.endeavorImage && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={s.endeavorImage}
                        alt=""
                        className="hidden sm:block w-40 object-cover shrink-0"
                      />
                    )}
                    <div className="p-5 min-w-0">
                      <div className="mb-2 flex items-center gap-2 text-xs text-medium-gray">
                        <span className="text-code-blue">{s.endeavorTitle}</span>
                        <span>&middot;</span>
                        <span>{s.endeavorCategory}</span>
                      </div>
                      <h2 className="mb-2 text-lg font-bold group-hover:text-code-green transition-colors">
                        {s.title}
                      </h2>
                      <p className="mb-3 text-sm text-medium-gray line-clamp-2 leading-relaxed">
                        {excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-medium-gray">
                        <span>by {s.authorName}</span>
                        <span>&middot;</span>
                        <time>
                          {new Date(s.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
