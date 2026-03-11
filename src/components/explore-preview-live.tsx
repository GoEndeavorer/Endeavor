import Link from "next/link";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { eq, desc, sql, or } from "drizzle-orm";

type LiveEndeavor = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  locationType: string;
  imageUrl: string | null;
  costPerPerson: number | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  capacity: number | null;
  memberCount: number;
};

const categoryColors: Record<string, string> = {
  Scientific: "border-code-blue text-code-blue",
  Tech: "border-purple-400 text-purple-400",
  Creative: "border-yellow-400 text-yellow-400",
  Adventure: "border-code-green text-code-green",
  Cultural: "border-orange-400 text-orange-400",
  Community: "border-pink-400 text-pink-400",
};

export async function ExplorePreviewLive() {
  let liveEndeavors: LiveEndeavor[] = [];

  try {
    const results = await db
      .select()
      .from(endeavor)
      .where(or(eq(endeavor.status, "open"), eq(endeavor.status, "in-progress")))
      .orderBy(desc(endeavor.createdAt))
      .limit(6);

    if (results.length > 0) {
      const ids = results.map((e) => e.id);
      const memberCounts = await db
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
        .groupBy(member.endeavorId);

      const countMap = new Map(memberCounts.map((m) => [m.endeavorId, m.count]));

      liveEndeavors = results.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category,
        location: e.location,
        locationType: e.locationType,
        imageUrl: e.imageUrl,
        costPerPerson: e.costPerPerson,
        fundingEnabled: e.fundingEnabled,
        fundingGoal: e.fundingGoal,
        fundingRaised: e.fundingRaised,
        capacity: e.capacity,
        memberCount: countMap.get(e.id) || 1,
      }));
    }
  } catch {
    // Fall through to show "no endeavors" state
  }

  if (liveEndeavors.length === 0) {
    return null; // Let the static ExplorePreview handle this case
  }

  return (
    <section id="explore" className="border-t border-medium-gray/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
          {"// live endeavors"}
        </h2>
        <p className="mb-12 text-2xl font-bold md:text-3xl">
          Happening right now.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liveEndeavors.map((e) => (
            <Link
              key={e.id}
              href={`/endeavors/${e.id}`}
              className="group flex flex-col border border-medium-gray/30 transition-colors hover:border-code-green/50 overflow-hidden"
            >
              {e.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={e.imageUrl}
                  alt=""
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-36 items-center justify-center bg-code-green/5">
                  <span className="text-3xl font-bold text-code-green/20">
                    {e.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`border px-2 py-0.5 text-xs uppercase ${
                      categoryColors[e.category] || "border-medium-gray text-medium-gray"
                    }`}
                  >
                    {e.category}
                  </span>
                  <span className="text-xs text-medium-gray">
                    {e.locationType === "in-person"
                      ? "In-Person"
                      : e.locationType === "remote"
                      ? "Remote"
                      : "In-Person / Remote"}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold group-hover:text-code-green transition-colors">
                  {e.title}
                </h3>
                {e.location && (
                  <p className="mb-1 text-xs text-medium-gray">{e.location}</p>
                )}
                <p className="mb-4 flex-1 text-sm leading-relaxed text-light-gray line-clamp-3">
                  {e.description}
                </p>

                <div className="mt-auto">
                  {e.costPerPerson !== null && e.costPerPerson > 0 && (
                    <p className="text-sm font-semibold text-code-green">
                      ${e.costPerPerson.toLocaleString()}/person
                    </p>
                  )}
                  {e.costPerPerson === 0 && (
                    <p className="text-sm font-semibold text-code-green">Free to join</p>
                  )}
                  {e.fundingEnabled && e.fundingGoal && e.fundingGoal > 0 && (
                    <div className="mt-2">
                      <div className="mb-1 flex justify-between text-xs text-medium-gray">
                        <span>${e.fundingRaised.toLocaleString()} raised</span>
                        <span>
                          {Math.round((e.fundingRaised / e.fundingGoal) * 100)}% of $
                          {e.fundingGoal.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-medium-gray/30">
                        <div
                          className="h-1 bg-code-green"
                          style={{
                            width: `${Math.min(100, (e.fundingRaised / e.fundingGoal) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-medium-gray/20 pt-3">
                  <span className="text-xs text-medium-gray">
                    {e.memberCount} joined
                    {e.capacity ? ` / ${e.capacity} spots` : ""}
                  </span>
                  <span className="text-xs font-semibold text-code-blue transition-colors group-hover:text-code-green">
                    View &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/feed"
            className="border border-medium-gray px-8 py-3 text-sm font-bold uppercase transition-colors hover:border-code-green hover:text-code-green"
          >
            Browse All Endeavors
          </Link>
          <Link
            href="/categories"
            className="border border-code-blue/30 px-8 py-3 text-sm font-bold uppercase text-code-blue transition-colors hover:border-code-blue hover:bg-code-blue hover:text-black"
          >
            Browse by Category
          </Link>
          <Link
            href="/endeavors/completed"
            className="border border-code-green/30 px-8 py-3 text-sm font-bold uppercase text-code-green transition-colors hover:border-code-green hover:bg-code-green hover:text-black"
          >
            Success Stories
          </Link>
        </div>
      </div>
    </section>
  );
}
