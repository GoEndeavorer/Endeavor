import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, member, endeavor, task, story, discussion } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      interests: user.interests,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const memberships = await db
    .select({
      endeavorId: endeavor.id,
      endeavorTitle: endeavor.title,
      endeavorCategory: endeavor.category,
      endeavorStatus: endeavor.status,
      endeavorImage: endeavor.imageUrl,
      role: member.role,
    })
    .from(member)
    .innerJoin(endeavor, eq(member.endeavorId, endeavor.id))
    .where(and(eq(member.userId, userId), eq(member.status, "approved")));

  // Gather stats
  const [taskStats] = await db
    .select({
      total: count(),
      completed: count(sql`CASE WHEN ${task.status} = 'done' THEN 1 END`),
    })
    .from(task)
    .where(eq(task.assigneeId, userId));

  const [storyCount] = await db
    .select({ count: count() })
    .from(story)
    .where(and(eq(story.authorId, userId), eq(story.published, true)));

  const [discussionCount] = await db
    .select({ count: count() })
    .from(discussion)
    .where(eq(discussion.authorId, userId));

  const created = memberships.filter((m) => m.role === "creator").length;
  const completed = memberships.filter((m) => m.endeavorStatus === "completed").length;

  return NextResponse.json({
    ...profile,
    endeavors: memberships,
    stats: {
      endeavorsJoined: memberships.length,
      endeavorsCreated: created,
      endeavorsCompleted: completed,
      tasksCompleted: taskStats?.completed ?? 0,
      tasksTotal: taskStats?.total ?? 0,
      storiesPublished: storyCount?.count ?? 0,
      discussions: discussionCount?.count ?? 0,
    },
  });
}
