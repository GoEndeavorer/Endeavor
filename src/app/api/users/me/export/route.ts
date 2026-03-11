import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [profile, endeavors, memberships, discussions, stories, tasks, endorsements] = await Promise.all([
    db.execute(sql`
      SELECT id, name, email, bio, location, skills, interests, website, github, twitter, linkedin, image, created_at
      FROM "user"
      WHERE id = ${userId}
      LIMIT 1
    `),
    db.execute(sql`
      SELECT id, title, description, category, status, location, created_at
      FROM endeavor
      WHERE creator_id = ${userId}
      ORDER BY created_at DESC
    `),
    db.execute(sql`
      SELECT m.role, m.status, m.joined_at, e.title as endeavor_title, e.id as endeavor_id
      FROM member m
      JOIN endeavor e ON m.endeavor_id = e.id
      WHERE m.user_id = ${userId}
      ORDER BY m.joined_at DESC
    `),
    db.execute(sql`
      SELECT d.content, d.created_at, e.title as endeavor_title
      FROM discussion d
      JOIN endeavor e ON d.endeavor_id = e.id
      WHERE d.author_id = ${userId}
      ORDER BY d.created_at DESC
    `),
    db.execute(sql`
      SELECT s.title, s.content, s.published, s.created_at, e.title as endeavor_title
      FROM story s
      JOIN endeavor e ON s.endeavor_id = e.id
      WHERE s.author_id = ${userId}
      ORDER BY s.created_at DESC
    `),
    db.execute(sql`
      SELECT t.title, t.status, t.priority, t.due_date, t.created_at, e.title as endeavor_title
      FROM task t
      JOIN endeavor e ON t.endeavor_id = e.id
      WHERE t.assignee_id = ${userId}
      ORDER BY t.created_at DESC
    `),
    db.execute(sql`
      SELECT e.skill, e.message, e.created_at, u.name as from_name
      FROM endorsement e
      JOIN "user" u ON e.from_user_id = u.id
      WHERE e.to_user_id = ${userId}
      ORDER BY e.created_at DESC
    `),
  ]);

  const exportData = {
    profile: profile.rows[0] || {},
    endeavorsCreated: endeavors.rows,
    memberships: memberships.rows,
    discussions: discussions.rows,
    stories: stories.rows,
    tasks: tasks.rows,
    endorsementsReceived: endorsements.rows,
    exportedAt: new Date().toISOString(),
    note: "This is a complete export of your Endeavor data.",
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="endeavor-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
