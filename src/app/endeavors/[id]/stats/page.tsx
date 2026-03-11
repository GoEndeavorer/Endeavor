import { db } from "@/lib/db";
import { endeavor, member, task, discussion, milestone, story } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [end] = await db
    .select({ title: endeavor.title })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) return { title: "Not Found" };
  return { title: `Stats — ${end.title} | Endeavor` };
}

export default async function EndeavorStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch endeavor details
  const [end] = await db
    .select({
      id: endeavor.id,
      title: endeavor.title,
      fundingEnabled: endeavor.fundingEnabled,
      fundingGoal: endeavor.fundingGoal,
      fundingRaised: endeavor.fundingRaised,
      createdAt: endeavor.createdAt,
    })
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) notFound();

  // Run all count queries in parallel
  const [
    [memberResult],
    [taskResult],
    [completedTaskResult],
    [discussionResult],
    [milestoneResult],
    [completedMilestoneResult],
    [storyResult],
  ] = await Promise.all([
    db.select({ count: count() }).from(member).where(eq(member.endeavorId, id)),
    db.select({ count: count() }).from(task).where(eq(task.endeavorId, id)),
    db
      .select({ count: count() })
      .from(task)
      .where(and(eq(task.endeavorId, id), eq(task.status, "done"))),
    db
      .select({ count: count() })
      .from(discussion)
      .where(eq(discussion.endeavorId, id)),
    db
      .select({ count: count() })
      .from(milestone)
      .where(eq(milestone.endeavorId, id)),
    db
      .select({ count: count() })
      .from(milestone)
      .where(and(eq(milestone.endeavorId, id), eq(milestone.completed, true))),
    db
      .select({ count: count() })
      .from(story)
      .where(and(eq(story.endeavorId, id), eq(story.published, true))),
  ]);

  const memberCount = memberResult.count;
  const taskCount = taskResult.count;
  const completedTaskCount = completedTaskResult.count;
  const discussionCount = discussionResult.count;
  const milestoneCount = milestoneResult.count;
  const completedMilestoneCount = completedMilestoneResult.count;
  const storyCount = storyResult.count;

  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(end.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const taskCompletionPct =
    taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

  const milestoneProgress =
    milestoneCount > 0
      ? `${completedMilestoneCount}/${milestoneCount}`
      : "0/0";

  const fundingPct =
    end.fundingEnabled && end.fundingGoal && end.fundingGoal > 0
      ? Math.round((end.fundingRaised / end.fundingGoal) * 100)
      : null;

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{
          label: `${end.title} — Stats`,
          href: `/endeavors/${id}/stats`,
        }}
      />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Public Stats</h1>
        <p className="mb-8 text-sm text-medium-gray">
          A snapshot of activity for{" "}
          <Link
            href={`/endeavors/${id}`}
            className="text-code-blue hover:text-code-green transition-colors"
          >
            {end.title}
          </Link>
        </p>

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3 grid-cols-2">
          {/* Members — green */}
          <div className="border border-code-green/30 p-5 text-center">
            <p className="text-3xl font-bold text-code-green">
              {memberCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-medium-gray">Members</p>
          </div>

          {/* Tasks — blue */}
          <div className="border border-code-blue/30 p-5 text-center">
            <p className="text-3xl font-bold text-code-blue">
              {taskCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-medium-gray">Tasks</p>
          </div>

          {/* Task completion — blue */}
          <div className="border border-code-blue/30 p-5 text-center">
            <p className="text-3xl font-bold text-code-blue">
              {taskCompletionPct}%
            </p>
            <p className="mt-1 text-xs text-medium-gray">Tasks Completed</p>
            <p className="mt-0.5 text-[10px] text-medium-gray/60">
              {completedTaskCount} of {taskCount}
            </p>
          </div>

          {/* Discussions — yellow */}
          <div className="border border-yellow-400/30 p-5 text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {discussionCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-medium-gray">Discussions</p>
          </div>

          {/* Milestones — purple */}
          <div className="border border-purple-400/30 p-5 text-center">
            <p className="text-3xl font-bold text-purple-400">
              {milestoneProgress}
            </p>
            <p className="mt-1 text-xs text-medium-gray">
              Milestones Completed
            </p>
          </div>

          {/* Stories — orange */}
          <div className="border border-orange-400/30 p-5 text-center">
            <p className="text-3xl font-bold text-orange-400">
              {storyCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-medium-gray">Stories Published</p>
          </div>
        </div>

        {/* Secondary row */}
        <div
          className={`mb-8 grid gap-4 ${fundingPct !== null ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
        >
          {/* Days active */}
          <div className="border border-medium-gray/20 p-5 text-center">
            <p className="text-3xl font-bold text-white">
              {daysSinceCreation.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-medium-gray">Days Since Creation</p>
          </div>

          {/* Funding — only if applicable */}
          {fundingPct !== null && (
            <div className="border border-code-green/30 p-5 text-center">
              <p className="text-3xl font-bold text-code-green">
                {fundingPct}%
              </p>
              <p className="mt-1 text-xs text-medium-gray">Funding Goal</p>
              <p className="mt-0.5 text-[10px] text-medium-gray/60">
                ${(end.fundingRaised / 100).toLocaleString()} of $
                {((end.fundingGoal ?? 0) / 100).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href={`/endeavors/${id}`}
            className="text-xs text-medium-gray hover:text-code-green transition-colors"
          >
            &larr; Back to {end.title}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
