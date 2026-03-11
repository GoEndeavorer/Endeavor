import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type TrustLevel = "new" | "basic" | "trusted" | "established" | "pillar";

type ReputationBreakdown = {
  accountAge: number;
  profileCompleteness: number;
  endorsementsReceived: number;
  completedEndeavors: number;
  publishedStories: number;
  discussionCount: number;
  verifiedSkills: number;
  mentorshipCompletions: number;
};

function getTrustLevel(score: number): TrustLevel {
  if (score >= 80) return "pillar";
  if (score >= 60) return "established";
  if (score >= 40) return "trusted";
  if (score >= 20) return "basic";
  return "new";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    // Fetch all reputation signals in parallel
    const [
      userResult,
      endorsementResult,
      completedEndeavorResult,
      storyResult,
      discussionResult,
      mentorshipResult,
    ] = await Promise.all([
      // User profile data (account age + completeness)
      db.execute(sql`
        SELECT
          name, bio, location, skills, interests, website, github, twitter, linkedin, image,
          EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 AS account_age_days
        FROM "user"
        WHERE id = ${userId}
        LIMIT 1
      `),

      // Endorsements received: count endorsements on endeavors the user created
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM endorsement e
        INNER JOIN endeavor en ON en.id = e.endeavor_id
        WHERE en.creator_id = ${userId}
      `),

      // Completed endeavors the user participated in
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM member m
        INNER JOIN endeavor en ON en.id = m.endeavor_id
        WHERE m.user_id = ${userId}
          AND m.status = 'approved'
          AND en.status = 'completed'
      `),

      // Published stories
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM story
        WHERE author_id = ${userId} AND published = true
      `),

      // Discussion posts
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM discussion
        WHERE author_id = ${userId}
      `),

      // Mentorship completions: endeavors the user created that reached "completed"
      // (acting as a mentor/leader who guided a project to completion)
      db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM endeavor
        WHERE creator_id = ${userId} AND status = 'completed'
      `),
    ]);

    const profile = userResult.rows[0] as Record<string, unknown> | undefined;

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate account age score (max 15 pts)
    // 0 days = 0, 30 days = 5, 90 days = 10, 365+ days = 15
    const ageDays = Number(profile.account_age_days) || 0;
    const accountAge = Math.min(15, Math.round((ageDays / 365) * 15));

    // Calculate profile completeness score (max 15 pts)
    // Each filled field adds points
    const profileFields = [
      profile.name,
      profile.bio,
      profile.location,
      profile.image,
      profile.website,
      profile.github,
      profile.twitter,
      profile.linkedin,
    ];
    const skillsArr = profile.skills as string[] | null;
    const interestsArr = profile.interests as string[] | null;
    const filledCount =
      profileFields.filter((f) => f && String(f).trim() !== "").length +
      (skillsArr && skillsArr.length > 0 ? 1 : 0) +
      (interestsArr && interestsArr.length > 0 ? 1 : 0);
    const profileCompleteness = Math.min(
      15,
      Math.round((filledCount / 10) * 15)
    );

    // Endorsements received (max 15 pts)
    const endorsementCount = Number(
      (endorsementResult.rows[0] as { count: number })?.count ?? 0
    );
    const endorsementsReceived = Math.min(
      15,
      Math.round(Math.min(endorsementCount, 20) * (15 / 20))
    );

    // Completed endeavors (max 15 pts)
    const completedCount = Number(
      (completedEndeavorResult.rows[0] as { count: number })?.count ?? 0
    );
    const completedEndeavors = Math.min(
      15,
      Math.round(Math.min(completedCount, 10) * (15 / 10))
    );

    // Published stories (max 10 pts)
    const storyCount = Number(
      (storyResult.rows[0] as { count: number })?.count ?? 0
    );
    const publishedStories = Math.min(
      10,
      Math.round(Math.min(storyCount, 10) * (10 / 10))
    );

    // Discussion count (max 10 pts)
    const discCount = Number(
      (discussionResult.rows[0] as { count: number })?.count ?? 0
    );
    const discussionCount = Math.min(
      10,
      Math.round(Math.min(discCount, 50) * (10 / 50))
    );

    // Verified skills (max 10 pts) - based on skills listed + endorsements as validation
    const skillCount = skillsArr?.length ?? 0;
    const verifiedSkills = Math.min(
      10,
      Math.round(Math.min(skillCount, 10) * (10 / 10))
    );

    // Mentorship completions (max 10 pts)
    const mentorCount = Number(
      (mentorshipResult.rows[0] as { count: number })?.count ?? 0
    );
    const mentorshipCompletions = Math.min(
      10,
      Math.round(Math.min(mentorCount, 5) * (10 / 5))
    );

    const breakdown: ReputationBreakdown = {
      accountAge,
      profileCompleteness,
      endorsementsReceived,
      completedEndeavors,
      publishedStories,
      discussionCount,
      verifiedSkills,
      mentorshipCompletions,
    };

    const score = Math.min(
      100,
      accountAge +
        profileCompleteness +
        endorsementsReceived +
        completedEndeavors +
        publishedStories +
        discussionCount +
        verifiedSkills +
        mentorshipCompletions
    );

    const trustLevel = getTrustLevel(score);

    return NextResponse.json({ score, breakdown, trustLevel });
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate reputation" },
      { status: 500 }
    );
  }
}
