import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import Link from "next/link";

const categoryIcons: Record<string, string> = {
  Adventure: ">",
  Scientific: "~",
  Creative: "*",
  Tech: "#",
  Cultural: "@",
  Community: "+",
  Environmental: "^",
  Education: "?",
  Health: "+",
  Business: "$",
};

const categoryColors: Record<string, string> = {
  Adventure: "text-code-green border-code-green/30 hover:border-code-green",
  Scientific: "text-code-blue border-code-blue/30 hover:border-code-blue",
  Creative: "text-yellow-400 border-yellow-400/30 hover:border-yellow-400",
  Tech: "text-purple-400 border-purple-400/30 hover:border-purple-400",
  Cultural: "text-orange-400 border-orange-400/30 hover:border-orange-400",
  Community: "text-pink-400 border-pink-400/30 hover:border-pink-400",
  Environmental: "text-emerald-400 border-emerald-400/30 hover:border-emerald-400",
  Education: "text-sky-400 border-sky-400/30 hover:border-sky-400",
};

export async function PopularCategories() {
  let categories: { category: string; count: number }[] = [];

  try {
    const result = await db.execute(sql`
      SELECT category, COUNT(*)::int as count
      FROM endeavor
      WHERE status IN ('open', 'in-progress')
      GROUP BY category
      ORDER BY count DESC
      LIMIT 8
    `);
    categories = result.rows as { category: string; count: number }[];
  } catch {
    return null;
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// popular categories"}
        </h2>
        <p className="mb-8 text-center text-sm text-medium-gray">
          Browse by what interests you
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat) => {
            const colors = categoryColors[cat.category] || "text-light-gray border-medium-gray/30 hover:border-light-gray";
            const icon = categoryIcons[cat.category] || ">";
            return (
              <Link
                key={cat.category}
                href={`/feed?category=${encodeURIComponent(cat.category)}`}
                className={`flex items-center gap-3 border p-4 transition-colors ${colors}`}
              >
                <span className="font-mono text-lg font-bold">{icon}</span>
                <div>
                  <p className="text-sm font-semibold">{cat.category}</p>
                  <p className="text-xs text-medium-gray">
                    {cat.count} active
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
