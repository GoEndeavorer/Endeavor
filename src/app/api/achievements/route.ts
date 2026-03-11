import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Ensure tables exist at runtime
async function ensureTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS achievement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '*',
      category TEXT NOT NULL DEFAULT 'milestone',
      criteria JSONB NOT NULL DEFAULT '{}',
      xp_reward INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_achievement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      achievement_id UUID NOT NULL REFERENCES achievement(id),
      earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, achievement_id)
    )
  `);
}

// Seed default achievements if table is empty
async function seedDefaults() {
  const countResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM achievement`
  );
  const count = Number(countResult.rows[0]?.count || 0);
  if (count > 0) return;

  const defaults = [
    // Community
    { name: "Spark", description: "Created your first endeavor", icon: "*", category: "community", criteria: { type: "endeavors_created", threshold: 1 }, xp_reward: 50 },
    { name: "Visionary", description: "Created 5 endeavors", icon: "*", category: "community", criteria: { type: "endeavors_created", threshold: 5 }, xp_reward: 150 },
    { name: "Architect", description: "Created 10 endeavors", icon: "*", category: "community", criteria: { type: "endeavors_created", threshold: 10 }, xp_reward: 300 },

    // Contribution
    { name: "Team Player", description: "Joined your first endeavor", icon: "+", category: "contribution", criteria: { type: "endeavors_joined", threshold: 1 }, xp_reward: 50 },
    { name: "Collaborator", description: "Joined 5 endeavors", icon: "+", category: "contribution", criteria: { type: "endeavors_joined", threshold: 5 }, xp_reward: 150 },
    { name: "Adventurer", description: "Joined 10 endeavors", icon: "+", category: "contribution", criteria: { type: "endeavors_joined", threshold: 10 }, xp_reward: 300 },

    // Milestone
    { name: "Doer", description: "Completed your first task", icon: "#", category: "milestone", criteria: { type: "tasks_completed", threshold: 1 }, xp_reward: 50 },
    { name: "Workhorse", description: "Completed 10 tasks", icon: "#", category: "milestone", criteria: { type: "tasks_completed", threshold: 10 }, xp_reward: 200 },
    { name: "Machine", description: "Completed 50 tasks", icon: "#", category: "milestone", criteria: { type: "tasks_completed", threshold: 50 }, xp_reward: 500 },
    { name: "Unstoppable", description: "Completed 100 tasks", icon: "#", category: "milestone", criteria: { type: "tasks_completed", threshold: 100 }, xp_reward: 1000 },

    // Skill
    { name: "Speaker", description: "Posted your first discussion message", icon: "~", category: "skill", criteria: { type: "discussions_posted", threshold: 1 }, xp_reward: 50 },
    { name: "Conversationalist", description: "Posted 50 discussion messages", icon: "~", category: "skill", criteria: { type: "discussions_posted", threshold: 50 }, xp_reward: 300 },
    { name: "Orator", description: "Posted 100 discussion messages", icon: "~", category: "skill", criteria: { type: "discussions_posted", threshold: 100 }, xp_reward: 500 },
    { name: "Storyteller", description: "Published your first story", icon: "$", category: "skill", criteria: { type: "stories_published", threshold: 1 }, xp_reward: 75 },
    { name: "Chronicler", description: "Published 5 stories", icon: "$", category: "skill", criteria: { type: "stories_published", threshold: 5 }, xp_reward: 250 },

    // Special
    { name: "Supporter", description: "Gave your first endorsement", icon: "^", category: "special", criteria: { type: "endorsements_given", threshold: 1 }, xp_reward: 50 },
    { name: "Respected", description: "Received 10 endorsements", icon: "^", category: "special", criteria: { type: "endorsements_received", threshold: 10 }, xp_reward: 400 },
    { name: "Milestone Maker", description: "Completed your first milestone", icon: "!", category: "milestone", criteria: { type: "milestones_completed", threshold: 1 }, xp_reward: 100 },
    { name: "Finisher", description: "Completed an endeavor you created", icon: ">", category: "special", criteria: { type: "endeavors_completed", threshold: 1 }, xp_reward: 500 },
    { name: "On Fire", description: "Active for 7 consecutive days", icon: "~", category: "special", criteria: { type: "streak_days", threshold: 7 }, xp_reward: 200 },
    { name: "Identity", description: "Filled out your complete profile", icon: "@", category: "special", criteria: { type: "profile_complete", threshold: 1 }, xp_reward: 75 },
  ];

  for (const a of defaults) {
    await db.execute(sql`
      INSERT INTO achievement (name, description, icon, category, criteria, xp_reward)
      VALUES (${a.name}, ${a.description}, ${a.icon}, ${a.category}, ${JSON.stringify(a.criteria)}::jsonb, ${a.xp_reward})
    `);
  }
}

type AchievementRow = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: Record<string, unknown>;
  xp_reward: number;
  created_at: string;
};

// GET: list all achievement definitions
export async function GET(request: NextRequest) {
  await ensureTables();
  await seedDefaults();

  const category = request.nextUrl.searchParams.get("category");

  let result;
  if (category) {
    result = await db.execute(
      sql`SELECT * FROM achievement WHERE category = ${category} ORDER BY xp_reward ASC, name ASC`
    );
  } else {
    result = await db.execute(
      sql`SELECT * FROM achievement ORDER BY category ASC, xp_reward ASC, name ASC`
    );
  }

  const achievements = result.rows as AchievementRow[];

  return NextResponse.json({ achievements });
}

// POST: create a new achievement definition (admin only)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const adminCheck = await db.execute(
    sql`SELECT role FROM user WHERE id = ${session.user.id}`
  );
  const userRole = (adminCheck.rows[0] as { role?: string })?.role;
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureTables();

  const body = await request.json();
  const { name, description, icon, category, criteria, xp_reward } = body;

  if (!name || !description) {
    return NextResponse.json(
      { error: "Name and description are required" },
      { status: 400 }
    );
  }

  const validCategories = ["community", "contribution", "milestone", "skill", "special"];
  if (category && !validCategories.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
      { status: 400 }
    );
  }

  const result = await db.execute(sql`
    INSERT INTO achievement (name, description, icon, category, criteria, xp_reward)
    VALUES (
      ${name},
      ${description},
      ${icon || "*"},
      ${category || "milestone"},
      ${JSON.stringify(criteria || {})}::jsonb,
      ${xp_reward || 0}
    )
    RETURNING *
  `);

  const achievement = result.rows[0] as AchievementRow;

  return NextResponse.json({ achievement }, { status: 201 });
}
