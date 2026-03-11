import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Insight = {
  type: "tip" | "alert" | "milestone" | "suggestion";
  icon: string;
  message: string;
  action?: { label: string; href: string };
};

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insights: Insight[] = [];

  // Check profile completeness
  const profileResult = await db.execute(sql`
    SELECT bio, skills, interests, location, image
    FROM "user"
    WHERE id = ${session.user.id}
  `);
  const profile = profileResult.rows[0] as {
    bio: string | null;
    skills: string[] | null;
    interests: string[] | null;
    location: string | null;
    image: string | null;
  } | undefined;

  if (profile) {
    const missing: string[] = [];
    if (!profile.bio) missing.push("bio");
    if (!profile.skills || profile.skills.length === 0) missing.push("skills");
    if (!profile.interests || profile.interests.length === 0) missing.push("interests");
    if (!profile.image) missing.push("profile photo");

    if (missing.length > 0) {
      insights.push({
        type: "tip",
        icon: "@",
        message: `Complete your profile — add your ${missing.slice(0, 2).join(" and ")} to get better recommendations.`,
        action: { label: "Edit Profile", href: "/profile" },
      });
    }
  }

  // Check for overdue tasks
  const overdueResult = await db.execute(sql`
    SELECT COUNT(*)::int as count
    FROM task t
    JOIN member m ON m.endeavor_id = t.endeavor_id AND m.user_id = ${session.user.id}
    WHERE t.assignee_id = ${session.user.id}
      AND t.status NOT IN ('done', 'cancelled')
      AND t.due_date < NOW()
  `);
  const overdueCount = (overdueResult.rows[0] as { count: number })?.count ?? 0;
  if (overdueCount > 0) {
    insights.push({
      type: "alert",
      icon: "!",
      message: `You have ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}. Update their status or extend deadlines.`,
      action: { label: "View Dashboard", href: "/dashboard" },
    });
  }

  // Check for endeavors needing attention (no activity in 7 days)
  const staleResult = await db.execute(sql`
    SELECT e.id, e.title
    FROM endeavor e
    WHERE e.creator_id = ${session.user.id}
      AND e.status IN ('open', 'in-progress')
      AND e.updated_at < NOW() - INTERVAL '7 days'
    LIMIT 3
  `);
  const staleEndeavors = staleResult.rows as { id: string; title: string }[];
  if (staleEndeavors.length > 0) {
    insights.push({
      type: "suggestion",
      icon: "~",
      message: `"${staleEndeavors[0].title}" hasn't had activity in over a week. Post an update to keep your team engaged.`,
      action: { label: "View Endeavor", href: `/endeavors/${staleEndeavors[0].id}` },
    });
  }

  // Suggest exploring if user has few endeavors
  const memberCountResult = await db.execute(sql`
    SELECT COUNT(*)::int as count
    FROM member
    WHERE user_id = ${session.user.id} AND status = 'approved'
  `);
  const memberCount = (memberCountResult.rows[0] as { count: number })?.count ?? 0;
  if (memberCount < 3) {
    insights.push({
      type: "suggestion",
      icon: ">",
      message: "Discover new endeavors that match your skills and interests.",
      action: { label: "Explore Feed", href: "/feed" },
    });
  }

  return NextResponse.json(insights);
}
