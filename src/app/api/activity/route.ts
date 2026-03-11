import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, milestone, story, member, user, update } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Fetch recent public activity across the platform
  const [newEndeavors, completedMilestones, publishedStories, recentUpdates, recentJoins] =
    await Promise.all([
      // Recently created endeavors
      db
        .select({
          id: endeavor.id,
          title: endeavor.title,
          category: endeavor.category,
          imageUrl: endeavor.imageUrl,
          creatorName: user.name,
          createdAt: endeavor.createdAt,
        })
        .from(endeavor)
        .innerJoin(user, eq(endeavor.creatorId, user.id))
        .orderBy(desc(endeavor.createdAt))
        .limit(10),

      // Recently completed milestones
      db
        .select({
          id: milestone.id,
          title: milestone.title,
          completedAt: milestone.completedAt,
          endeavorId: endeavor.id,
          endeavorTitle: endeavor.title,
        })
        .from(milestone)
        .innerJoin(endeavor, eq(milestone.endeavorId, endeavor.id))
        .where(eq(milestone.completed, true))
        .orderBy(desc(milestone.completedAt))
        .limit(10),

      // Recently published stories
      db
        .select({
          id: story.id,
          title: story.title,
          authorName: user.name,
          endeavorId: endeavor.id,
          endeavorTitle: endeavor.title,
          createdAt: story.createdAt,
        })
        .from(story)
        .innerJoin(user, eq(story.authorId, user.id))
        .innerJoin(endeavor, eq(story.endeavorId, endeavor.id))
        .where(eq(story.published, true))
        .orderBy(desc(story.createdAt))
        .limit(10),

      // Recent updates
      db
        .select({
          id: update.id,
          title: update.title,
          content: update.content,
          authorName: user.name,
          endeavorId: endeavor.id,
          endeavorTitle: endeavor.title,
          createdAt: update.createdAt,
        })
        .from(update)
        .innerJoin(user, eq(update.authorId, user.id))
        .innerJoin(endeavor, eq(update.endeavorId, endeavor.id))
        .orderBy(desc(update.createdAt))
        .limit(10),

      // Recent joins
      db
        .select({
          id: member.id,
          userName: user.name,
          endeavorId: endeavor.id,
          endeavorTitle: endeavor.title,
          joinedAt: member.joinedAt,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .innerJoin(endeavor, eq(member.endeavorId, endeavor.id))
        .where(and(eq(member.status, "approved"), eq(member.role, "collaborator")))
        .orderBy(desc(member.joinedAt))
        .limit(10),
    ]);

  type ActivityItem = {
    type: "endeavor" | "milestone" | "story" | "update" | "join";
    id: string;
    title: string;
    detail: string | null;
    endeavorId: string | null;
    endeavorTitle: string | null;
    actorName: string;
    imageUrl: string | null;
    createdAt: string;
  };

  const items: ActivityItem[] = [
    ...newEndeavors.map((e) => ({
      type: "endeavor" as const,
      id: e.id,
      title: `New endeavor: ${e.title}`,
      detail: e.category,
      endeavorId: e.id,
      endeavorTitle: e.title,
      actorName: e.creatorName,
      imageUrl: e.imageUrl,
      createdAt: e.createdAt.toISOString(),
    })),
    ...completedMilestones.map((m) => ({
      type: "milestone" as const,
      id: m.id,
      title: `Milestone completed: ${m.title}`,
      detail: null,
      endeavorId: m.endeavorId,
      endeavorTitle: m.endeavorTitle,
      actorName: "",
      imageUrl: null,
      createdAt: (m.completedAt || new Date()).toISOString(),
    })),
    ...publishedStories.map((s) => ({
      type: "story" as const,
      id: s.id,
      title: `Story published: ${s.title}`,
      detail: null,
      endeavorId: s.endeavorId,
      endeavorTitle: s.endeavorTitle,
      actorName: s.authorName,
      imageUrl: null,
      createdAt: s.createdAt.toISOString(),
    })),
    ...recentUpdates.map((u) => ({
      type: "update" as const,
      id: u.id,
      title: u.title,
      detail: u.content.length > 120 ? u.content.slice(0, 120) + "..." : u.content,
      endeavorId: u.endeavorId,
      endeavorTitle: u.endeavorTitle,
      actorName: u.authorName,
      imageUrl: null,
      createdAt: u.createdAt.toISOString(),
    })),
    ...recentJoins.map((j) => ({
      type: "join" as const,
      id: j.id,
      title: `${j.userName} joined`,
      detail: null,
      endeavorId: j.endeavorId,
      endeavorTitle: j.endeavorTitle,
      actorName: j.userName,
      imageUrl: null,
      createdAt: j.joinedAt.toISOString(),
    })),
  ];

  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(items.slice(0, 50));
}
