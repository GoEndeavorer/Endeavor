import { db } from "@/lib/db";
import { endeavor } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const baseUrl = process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app";

  const result = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.description,
      e.category,
      e.status,
      e.image_url,
      e.cost_per_person,
      e.funding_enabled,
      e.funding_goal,
      e.funding_raised,
      (SELECT COUNT(*) FROM member WHERE member.endeavor_id = e.id AND member.status = 'approved') as member_count
    FROM endeavor e
    WHERE e.id = ${id}
    LIMIT 1
  `);

  const end = result.rows[0] as {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    image_url: string | null;
    cost_per_person: number | null;
    funding_enabled: boolean;
    funding_goal: number | null;
    funding_raised: number;
    member_count: number;
  } | undefined;

  if (!end) {
    return (
      <div style={{ padding: 20, fontFamily: "monospace", color: "#666", background: "#000" }}>
        Endeavor not found
      </div>
    );
  }

  const desc = end.description.length > 120
    ? end.description.slice(0, 117) + "..."
    : end.description;

  return (
    <html>
      <body style={{ margin: 0, padding: 0, background: "#000", fontFamily: "'Fira Code', monospace" }}>
        <a
          href={`${baseUrl}/endeavors/${end.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textDecoration: "none",
            border: "1px solid #333",
            maxWidth: 400,
            overflow: "hidden",
          }}
        >
          {end.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={end.image_url}
              alt=""
              style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
            />
          )}
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{
                border: "1px solid #00FF0050",
                color: "#00FF00",
                padding: "2px 8px",
                fontSize: 10,
                textTransform: "uppercase",
              }}>
                {end.category}
              </span>
              <span style={{ fontSize: 10, color: "#666" }}>
                {end.status}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              {end.title}
            </div>
            <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5, marginBottom: 12 }}>
              {desc}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "#00FF00" }}>
                {Number(end.member_count)} members
              </span>
              {end.funding_enabled && end.funding_goal ? (
                <span style={{ color: "#eab308" }}>
                  ${Number(end.funding_raised).toLocaleString()} / ${Number(end.funding_goal).toLocaleString()}
                </span>
              ) : end.cost_per_person ? (
                <span style={{ color: "#00A1D6" }}>
                  ${Number(end.cost_per_person)}/person
                </span>
              ) : (
                <span style={{ color: "#00A1D6" }}>Free to join</span>
              )}
            </div>
            <div style={{ marginTop: 12, borderTop: "1px solid #333", paddingTop: 8, fontSize: 10, color: "#666", textAlign: "right" as const }}>
              View on Endeavor &rarr;
            </div>
          </div>
        </a>
      </body>
    </html>
  );
}
