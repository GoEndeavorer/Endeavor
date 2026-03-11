import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Note: Edge runtime may not support all DB drivers.
  // This will work with Neon's HTTP driver.
  let name = "User";
  let bio = "";
  let endeavorCount = 0;
  let skillCount = 0;

  try {
    const result = await db.execute(sql`
      SELECT
        u.name,
        u.bio,
        array_length(u.skills, 1) as skill_count,
        (SELECT COUNT(*) FROM member m WHERE m.user_id = u.id AND m.status = 'approved') as endeavor_count
      FROM "user" u
      WHERE u.id = ${userId}
      LIMIT 1
    `);
    const row = result.rows[0] as {
      name: string;
      bio: string | null;
      skill_count: number | null;
      endeavor_count: number;
    } | undefined;
    if (row) {
      name = row.name;
      bio = row.bio?.slice(0, 80) || "";
      endeavorCount = Number(row.endeavor_count);
      skillCount = Number(row.skill_count) || 0;
    }
  } catch {
    // Fallback to placeholder
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px",
          background: "#000",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#00FF0020",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              color: "#00FF00",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>{name}</div>
            {bio && <div style={{ fontSize: "14px", color: "#999", marginTop: "4px" }}>{bio}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", marginTop: "16px" }}>
          <div>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#00FF00" }}>{endeavorCount}</span>
            <span style={{ fontSize: "12px", color: "#666", marginLeft: "8px" }}>endeavors</span>
          </div>
          <div>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#00A1D6" }}>{skillCount}</span>
            <span style={{ fontSize: "12px", color: "#666", marginLeft: "8px" }}>skills</span>
          </div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "12px", color: "#444" }}>
          endeavor.vercel.app
        </div>
      </div>
    ),
    { width: 600, height: 300 }
  );
}
