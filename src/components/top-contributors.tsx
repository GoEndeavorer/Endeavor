import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import Link from "next/link";

export async function TopContributors() {
  let contributors: { id: string; name: string; image: string | null; score: number }[] = [];

  try {
    const result = await db.execute(sql`
      SELECT
        u.id,
        u.name,
        u.image,
        (
          (SELECT COUNT(*) FROM endeavor e WHERE e.creator_id = u.id) * 5 +
          (SELECT COUNT(*) FROM discussion d WHERE d.author_id = u.id) * 1 +
          (SELECT COUNT(*) FROM story s WHERE s.author_id = u.id AND s.published = true) * 3 +
          (SELECT COUNT(*) FROM task t WHERE t.assignee_id = u.id AND t.status = 'done') * 2
        )::int as score
      FROM "user" u
      WHERE u.created_at < NOW() - INTERVAL '1 day'
      ORDER BY score DESC
      LIMIT 8
    `);
    contributors = result.rows as typeof contributors;
  } catch {
    return null;
  }

  if (contributors.length === 0 || contributors.every((c) => c.score === 0)) return null;

  // Filter out zero-score users
  const active = contributors.filter((c) => c.score > 0);
  if (active.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// top contributors"}
        </h2>
        <p className="mb-8 text-center text-sm text-medium-gray">
          Most active community members
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {active.map((user, i) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="flex flex-col items-center gap-2 border border-medium-gray/20 p-4 w-28 transition-colors hover:border-code-green/30"
            >
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.image}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-code-green/10 text-lg font-bold text-code-green">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-xs font-semibold text-center truncate w-full">
                {user.name}
              </p>
              <span className="text-[10px] text-medium-gray">
                #{i + 1}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/leaderboard"
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            View full leaderboard &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
