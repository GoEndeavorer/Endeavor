import { db } from "@/lib/db";
import { user, endeavor, member } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";

export async function TrendingCreators() {
  const creators = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
      endeavorCount: sql<number>`(
        SELECT COUNT(DISTINCT endeavor.id)
        FROM endeavor
        WHERE endeavor.creator_id = "user".id
        AND endeavor.status != 'cancelled'
        AND endeavor.status != 'draft'
      )`,
      totalMembers: sql<number>`(
        SELECT COUNT(*)
        FROM member
        INNER JOIN endeavor ON member.endeavor_id = endeavor.id
        WHERE endeavor.creator_id = "user".id
        AND member.status = 'approved'
        AND member.role = 'collaborator'
      )`,
    })
    .from(user)
    .where(
      sql`EXISTS (
        SELECT 1 FROM endeavor
        WHERE endeavor.creator_id = "user".id
        AND endeavor.status != 'cancelled'
        AND endeavor.status != 'draft'
      )`
    )
    .orderBy(
      sql`(
        SELECT COUNT(*)
        FROM member
        INNER JOIN endeavor ON member.endeavor_id = endeavor.id
        WHERE endeavor.creator_id = "user".id
        AND member.status = 'approved'
      ) DESC`
    )
    .limit(6);

  if (creators.length === 0) return null;

  return (
    <section className="border-t border-medium-gray/30 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// active creators"}
          </p>
          <Link href="/people" className="text-xs text-medium-gray hover:text-code-green">
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/users/${c.id}`}
              className="group flex items-center gap-3 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-code-blue/10 text-sm font-bold text-code-blue">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-code-green transition-colors">
                  {c.name}
                </p>
                <p className="text-xs text-medium-gray">
                  {Number(c.endeavorCount)} endeavor{Number(c.endeavorCount) !== 1 ? "s" : ""} &middot; {Number(c.totalMembers)} collaborator{Number(c.totalMembers) !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
