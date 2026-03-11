import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, task, story, discussion } from "@/lib/db/schema";
import { eq, and, sql, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
};

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Gather stats for the user
  const [createdCount] = await db
    .select({ count: count() })
    .from(endeavor)
    .where(eq(endeavor.creatorId, userId));

  const [joinedCount] = await db
    .select({ count: count() })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.status, "approved")));

  const [tasksDone] = await db
    .select({ count: count() })
    .from(task)
    .where(and(eq(task.assigneeId, userId), eq(task.status, "done")));

  const [storiesWritten] = await db
    .select({ count: count() })
    .from(story)
    .where(and(eq(story.authorId, userId), eq(story.published, true)));

  const [messagesPosted] = await db
    .select({ count: count() })
    .from(discussion)
    .where(eq(discussion.authorId, userId));

  const c = createdCount.count;
  const j = joinedCount.count;
  const t = tasksDone.count;
  const s = storiesWritten.count;
  const m = messagesPosted.count;

  const badges: Badge[] = [
    {
      id: "first-endeavor",
      name: "Trailblazer",
      description: "Created your first endeavor",
      icon: "*",
      color: "text-code-green",
      earned: c >= 1,
    },
    {
      id: "five-endeavors",
      name: "Serial Starter",
      description: "Created 5 endeavors",
      icon: "**",
      color: "text-code-green",
      earned: c >= 5,
    },
    {
      id: "first-join",
      name: "Team Player",
      description: "Joined your first endeavor",
      icon: "+",
      color: "text-code-blue",
      earned: j >= 1,
    },
    {
      id: "five-joins",
      name: "Collaborator",
      description: "Joined 5 endeavors",
      icon: "++",
      color: "text-code-blue",
      earned: j >= 5,
    },
    {
      id: "first-task",
      name: "Doer",
      description: "Completed your first task",
      icon: ">",
      color: "text-yellow-400",
      earned: t >= 1,
    },
    {
      id: "ten-tasks",
      name: "Workhorse",
      description: "Completed 10 tasks",
      icon: ">>",
      color: "text-yellow-400",
      earned: t >= 10,
    },
    {
      id: "first-story",
      name: "Storyteller",
      description: "Published your first story",
      icon: "#",
      color: "text-purple-400",
      earned: s >= 1,
    },
    {
      id: "active-voice",
      name: "Active Voice",
      description: "Posted 10 discussion messages",
      icon: "~",
      color: "text-orange-400",
      earned: m >= 10,
    },
    {
      id: "community-pillar",
      name: "Community Pillar",
      description: "Created 3+ endeavors and joined 3+ more",
      icon: "^",
      color: "text-pink-400",
      earned: c >= 3 && j >= 3,
    },
    {
      id: "polymath",
      name: "Polymath",
      description: "Earned 5 or more badges",
      icon: "***",
      color: "text-white",
      earned: false, // calculated below
    },
  ];

  // Calculate polymath badge (earned 5+ other badges)
  const earnedCount = badges.filter((b) => b.earned && b.id !== "polymath").length;
  const polymathBadge = badges.find((b) => b.id === "polymath")!;
  polymathBadge.earned = earnedCount >= 5;

  return NextResponse.json(badges);
}
