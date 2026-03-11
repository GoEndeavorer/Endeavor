import Link from "next/link";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { eq, desc, sql, or } from "drizzle-orm";

const categoryColors: Record<string, string> = {
  Scientific: "border-code-blue text-code-blue",
  Tech: "border-purple-400 text-purple-400",
  Creative: "border-yellow-400 text-yellow-400",
  Adventure: "border-code-green text-code-green",
  Cultural: "border-orange-400 text-orange-400",
  Community: "border-pink-400 text-pink-400",
};

export async function FeaturedEndeavors() {
  let featured: {
    id: string;
    title: string;
    description: string;
    category: string;
    memberCount: number;
  }[] = [];

  try {
    const results = await db
      .select({
        endeavor: endeavor,
        memberCount: sql<number>`count(${member.id})::int`,
      })
      .from(endeavor)
      .leftJoin(
        member,
        sql`${member.endeavorId} = ${endeavor.id} AND ${member.status} = 'approved'`
      )
      .where(or(eq(endeavor.status, "open"), eq(endeavor.status, "in-progress")))
      .groupBy(endeavor.id)
      .orderBy(desc(sql`count(${member.id})`), desc(endeavor.createdAt))
      .limit(3);

    featured = results.map((r) => ({
      id: r.endeavor.id,
      title: r.endeavor.title,
      description: r.endeavor.description,
      category: r.endeavor.category,
      memberCount: (r.memberCount || 0) + 1,
    }));
  } catch {
    return null;
  }

  if (featured.length === 0) return null;

  return (
    <section className="border-t border-medium-gray/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// featured endeavors"}
        </h2>
        <p className="mb-10 text-center text-2xl font-bold md:text-3xl">
          Join something worth doing.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((e) => (
            <Link
              key={e.id}
              href={`/endeavors/${e.id}`}
              className="group flex flex-col border border-medium-gray/20 p-6 transition-colors hover:border-code-green/50"
            >
              <div className="mb-3">
                <span
                  className={`border px-2 py-0.5 text-xs uppercase ${
                    categoryColors[e.category] ||
                    "border-medium-gray text-medium-gray"
                  }`}
                >
                  {e.category}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-code-green transition-colors">
                {e.title}
              </h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-medium-gray line-clamp-3">
                {e.description.slice(0, 160)}
                {e.description.length > 160 ? "..." : ""}
              </p>
              <div className="flex items-center justify-between border-t border-medium-gray/20 pt-3">
                <span className="text-xs text-medium-gray">
                  {e.memberCount} {e.memberCount === 1 ? "member" : "members"}
                </span>
                <span className="text-xs font-semibold text-code-blue transition-colors group-hover:text-code-green">
                  View &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/feed"
            className="text-sm text-medium-gray hover:text-code-green transition-colors"
          >
            Explore all endeavors &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
