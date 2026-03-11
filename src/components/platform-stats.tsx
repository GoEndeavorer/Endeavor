import { db } from "@/lib/db";
import { endeavor, member, user } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function PlatformStats() {
  try {
    const [totalEndeavors, totalUsers, totalMembers] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(endeavor)
        .where(sql`${endeavor.status} IN ('open', 'in-progress', 'completed')`),
      db.select({ count: sql<number>`count(*)::int` }).from(user),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(member)
        .where(sql`${member.status} = 'approved'`),
    ]);

    const stats = [
      { label: "Endeavors", value: totalEndeavors[0]?.count || 0 },
      { label: "Members", value: totalUsers[0]?.count || 0 },
      { label: "Collaborations", value: totalMembers[0]?.count || 0 },
    ];

    // Don't show if no data
    if (stats.every((s) => s.value === 0)) return null;

    return (
      <section className="border-t border-b border-medium-gray/20 bg-black/50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-code-green md:text-4xl">
                  {stat.value.toLocaleString()}
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-medium-gray">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
