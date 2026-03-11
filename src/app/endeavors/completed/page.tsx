export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { endeavor, member, story } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const metadata = {
  title: "Completed Endeavors | Endeavor",
  description: "Browse completed endeavors and read stories from the people who made them happen.",
};

export default async function CompletedEndeavorsPage() {
  const completed = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.status, "completed"))
    .orderBy(desc(endeavor.updatedAt))
    .limit(50);

  const ids = completed.map((e) => e.id);

  const memberCounts =
    ids.length > 0
      ? await db
          .select({
            endeavorId: member.endeavorId,
            count: sql<number>`count(*)::int`,
          })
          .from(member)
          .where(
            sql`${member.endeavorId} IN (${sql.join(
              ids.map((id) => sql`${id}`),
              sql`, `
            )}) AND ${member.status} = 'approved'`
          )
          .groupBy(member.endeavorId)
      : [];

  const storyCounts =
    ids.length > 0
      ? await db
          .select({
            endeavorId: story.endeavorId,
            count: sql<number>`count(*)::int`,
          })
          .from(story)
          .where(
            sql`${story.endeavorId} IN (${sql.join(
              ids.map((id) => sql`${id}`),
              sql`, `
            )}) AND ${story.published} = true`
          )
          .groupBy(story.endeavorId)
      : [];

  const memberMap = new Map(memberCounts.map((m) => [m.endeavorId, m.count]));
  const storyMap = new Map(storyCounts.map((s) => [s.endeavorId, s.count]));

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">Endeavor</Link>
          <Link href="/feed" className="text-sm text-code-blue hover:text-code-green">
            Explore
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Completed Endeavors</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Real projects, completed by real people. Read their stories.
        </p>

        {completed.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-medium-gray">No completed endeavors yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completed.map((e) => {
              const members = (memberMap.get(e.id) || 0) + 1;
              const stories = storyMap.get(e.id) || 0;
              return (
                <Link
                  key={e.id}
                  href={`/endeavors/${e.id}`}
                  className="group flex flex-col border border-code-green/20 p-5 transition-colors hover:border-code-green/50"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="border border-code-green px-2 py-0.5 text-xs uppercase text-code-green">
                      Completed
                    </span>
                    <span className="text-xs text-medium-gray">{e.category}</span>
                  </div>
                  <h3 className="mb-1 text-lg font-bold">{e.title}</h3>
                  {e.location && (
                    <p className="mb-1 text-xs text-medium-gray">{e.location}</p>
                  )}
                  <p className="mb-4 flex-1 text-sm text-light-gray line-clamp-3">
                    {e.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-medium-gray/20 pt-3">
                    <div className="flex gap-3 text-xs text-medium-gray">
                      <span>{members} crew</span>
                      {stories > 0 && (
                        <span className="text-code-blue">{stories} {stories === 1 ? "story" : "stories"}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-code-green group-hover:text-white">
                      View &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
