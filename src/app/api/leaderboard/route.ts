import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, member, endeavor, task, story, discussion } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Top creators (most endeavors created)
  const topCreators = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      count: sql<number>`(
        SELECT COUNT(*) FROM ${endeavor}
        WHERE ${endeavor.creatorId} = ${user.id}
      )::int`,
    })
    .from(user)
    .orderBy(
      sql`(SELECT COUNT(*) FROM ${endeavor} WHERE ${endeavor.creatorId} = ${user.id}) DESC`
    )
    .limit(10);

  // Top contributors (most endeavors joined)
  const topContributors = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      count: sql<number>`(
        SELECT COUNT(*) FROM ${member}
        WHERE ${member.userId} = ${user.id} AND ${member.status} = 'approved'
      )::int`,
    })
    .from(user)
    .orderBy(
      sql`(SELECT COUNT(*) FROM ${member} WHERE ${member.userId} = ${user.id} AND ${member.status} = 'approved') DESC`
    )
    .limit(10);

  // Most active (tasks + discussions + stories combined)
  const mostActive = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      tasks: sql<number>`(SELECT COUNT(*) FROM ${task} WHERE ${task.assigneeId} = ${user.id} AND ${task.status} = 'done')::int`,
      stories: sql<number>`(SELECT COUNT(*) FROM ${story} WHERE ${story.authorId} = ${user.id} AND ${story.published} = true)::int`,
      discussions: sql<number>`(SELECT COUNT(*) FROM ${discussion} WHERE ${discussion.authorId} = ${user.id})::int`,
    })
    .from(user)
    .orderBy(
      sql`(
        (SELECT COUNT(*) FROM ${task} WHERE ${task.assigneeId} = ${user.id} AND ${task.status} = 'done') +
        (SELECT COUNT(*) FROM ${story} WHERE ${story.authorId} = ${user.id} AND ${story.published} = true) +
        (SELECT COUNT(*) FROM ${discussion} WHERE ${discussion.authorId} = ${user.id})
      ) DESC`
    )
    .limit(10);

  return NextResponse.json({
    topCreators: topCreators.filter((u) => u.count > 0),
    topContributors: topContributors.filter((u) => u.count > 0),
    mostActive: mostActive.filter(
      (u) => u.tasks + u.stories + u.discussions > 0
    ),
  });
}
