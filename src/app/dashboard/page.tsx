"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";
import { ActivitySparkline } from "@/components/activity-sparkline";
import { ActivityStreak } from "@/components/activity-streak";
import { WeeklyGoals } from "@/components/weekly-goals";
import { DashboardInsights } from "@/components/dashboard-insights";

/* ── types ─────────────────────────────────────────────────── */

type Endeavor = {
  id: string;
  title: string;
  status: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  role: string;
};

type PendingTask = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  endeavorId: string;
  endeavorTitle: string;
  createdAt: string;
};

type ActivityItem = {
  id: string;
  type: string;
  message: string;
  endeavorId: string | null;
  read: boolean;
  createdAt: string;
};

type DashboardData = {
  endeavors: Endeavor[];
  statusCounts: Record<string, number>;
  pendingTasks: PendingTask[];
  unreadNotifications: number;
  recentActivity: ActivityItem[];
  stats: {
    totalEndeavors: number;
    tasksCompleted: number;
    discussionsPosted: number;
    storiesWritten: number;
  };
};

type AchievementData = {
  unlocked: { key: string; unlockedAt: string }[];
  total: number;
};

/* ── status maps ───────────────────────────────────────────── */

const statusColors: Record<string, string> = {
  open: "text-code-green",
  "in-progress": "text-code-blue",
  completed: "text-green-400",
  draft: "text-medium-gray",
  cancelled: "text-red-400",
  todo: "text-yellow-400",
};

const statusIcons: Record<string, string> = {
  open: "o",
  "in-progress": "~",
  completed: "*",
  draft: ".",
  cancelled: "x",
};

const activityIcons: Record<string, string> = {
  join_request: "+",
  member_joined: "+",
  new_discussion: "#",
  task_assigned: ">",
  funding_received: "$",
  milestone_completed: "*",
  status_change: "~",
  update_posted: "!",
  member_left: "-",
};

/* ── skeleton components ───────────────────────────────────── */

function StatSkeleton() {
  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="h-3 w-20 animate-pulse bg-medium-gray/10 mb-3" />
      <div className="h-8 w-12 animate-pulse bg-medium-gray/10 mb-2" />
      <div className="h-3 w-16 animate-pulse bg-medium-gray/10" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 border border-medium-gray/20 p-4 animate-pulse">
      <div className="h-10 w-12 shrink-0 bg-medium-gray/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-medium-gray/10" />
        <div className="h-3 w-1/3 bg-medium-gray/10" />
      </div>
      <div className="h-3 w-16 bg-medium-gray/10 shrink-0" />
    </div>
  );
}

function AchievementBarSkeleton() {
  return (
    <div className="border border-medium-gray/20 p-4 animate-pulse">
      <div className="h-3 w-32 bg-medium-gray/10 mb-3" />
      <div className="h-2 w-full bg-medium-gray/10 rounded-full mb-2" />
      <div className="h-3 w-20 bg-medium-gray/10" />
    </div>
  );
}

/* ── due date helpers ──────────────────────────────────────── */

function isDueOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

function isDueSoon(dueDate: string): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

/* ── main component ────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [achievements, setAchievements] = useState<AchievementData | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch all dashboard data in parallel
  useEffect(() => {
    if (!session) return;

    Promise.all([
      fetch("/api/dashboard").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/achievements").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/messages/unread").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([dashboardData, achievementData, messagesData]) => {
        if (dashboardData) setData(dashboardData);
        if (achievementData) setAchievements(achievementData);
        if (messagesData) setUnreadMessages(messagesData.count ?? 0);
      })
      .catch(() => {
        toast("Failed to load dashboard data", "error");
      })
      .finally(() => setLoading(false));
  }, [session, toast]);

  // Auth loading state
  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        <span className="animate-pulse font-mono text-sm">loading session...</span>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const achievementPercent =
    achievements && achievements.total > 0
      ? Math.round((achievements.unlocked.length / achievements.total) * 100)
      : 0;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Dashboard", href: "/dashboard" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* ── greeting ───────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-xl font-bold">
            Welcome back, {session.user.name}
          </h1>
          <p className="mt-1 text-sm text-medium-gray">{today}</p>
        </div>

        {loading || !data ? (
          /* ── loading skeletons ────────────────────────── */
          <div className="space-y-10">
            {/* Stats skeletons */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatSkeleton key={i} />
              ))}
            </div>
            {/* Achievement bar skeleton */}
            <AchievementBarSkeleton />
            {/* Endeavor rows skeleton */}
            <div>
              <div className="h-3 w-32 bg-medium-gray/10 animate-pulse mb-4" />
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            </div>
            {/* Task rows skeleton */}
            <div>
              <div className="h-3 w-28 bg-medium-gray/10 animate-pulse mb-4" />
              <div className="space-y-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            </div>
            {/* Notifications skeleton */}
            <div>
              <div className="h-3 w-40 bg-medium-gray/10 animate-pulse mb-4" />
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 w-full animate-pulse bg-medium-gray/10"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── quick stats row ──────────────────────── */}
            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-medium-gray/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
                  {"// endeavors"}
                </p>
                <p className="text-2xl font-bold">{data.stats.totalEndeavors}</p>
                <p className="mt-1 text-xs text-medium-gray">
                  {data.statusCounts["in-progress"] || 0} active
                </p>
              </div>
              <div className="border border-medium-gray/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
                  {"// tasks pending"}
                </p>
                <p className="text-2xl font-bold">{data.pendingTasks.length}</p>
                <p className="mt-1 text-xs text-medium-gray">
                  {data.stats.tasksCompleted} completed
                </p>
              </div>
              <Link
                href="/notifications"
                className="border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
                  {"// notifications"}
                </p>
                <p className="text-2xl font-bold">
                  {data.unreadNotifications}
                  {data.unreadNotifications > 0 && (
                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-code-green animate-pulse" />
                  )}
                </p>
                <p className="mt-1 text-xs text-medium-gray">unread</p>
              </Link>
              <Link
                href="/messages"
                className="border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
                  {"// messages"}
                </p>
                <p className="text-2xl font-bold">
                  {unreadMessages}
                  {unreadMessages > 0 && (
                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-code-blue animate-pulse" />
                  )}
                </p>
                <p className="mt-1 text-xs text-medium-gray">unread</p>
              </Link>
            </div>

            {/* ── achievement progress ─────────────────── */}
            {achievements && (
              <section className="mb-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// achievements"}
                </h2>
                <Link
                  href="/profile"
                  className="block border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">
                      {achievements.unlocked.length}{" "}
                      <span className="text-medium-gray font-normal">
                        / {achievements.total} unlocked
                      </span>
                    </span>
                    <span className="font-mono text-xs text-code-green">
                      {achievementPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-medium-gray/10 overflow-hidden">
                    <div
                      className="h-full bg-code-green transition-all duration-500"
                      style={{ width: `${achievementPercent}%` }}
                    />
                  </div>
                  {achievements.unlocked.length > 0 && (
                    <p className="mt-2 text-xs text-medium-gray">
                      Last unlocked {formatTimeAgo(
                        achievements.unlocked[achievements.unlocked.length - 1].unlockedAt
                      )}
                    </p>
                  )}
                </Link>
              </section>
            )}

            {/* ── your endeavors ───────────────────────── */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// your endeavors"}
                </h2>
                {data.endeavors.length > 0 && (
                  <span className="text-xs text-medium-gray">
                    {data.endeavors.length} total
                  </span>
                )}
              </div>
              {data.endeavors.length === 0 ? (
                <div className="border border-medium-gray/20 p-8 text-center">
                  <p className="text-sm text-medium-gray mb-3">
                    You haven&apos;t created or joined any endeavors yet.
                  </p>
                  <Link
                    href="/endeavors/create"
                    className="text-xs text-code-blue hover:text-code-green transition-colors"
                  >
                    Create your first endeavor &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.endeavors.map((e) => (
                    <Link
                      key={e.id}
                      href={`/endeavors/${e.id}`}
                      className="flex items-center gap-3 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                    >
                      {e.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={e.imageUrl}
                          alt=""
                          className="h-10 w-12 shrink-0 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-12 shrink-0 items-center justify-center bg-code-green/10 text-xs font-bold text-code-green">
                          {e.title.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {e.title}
                        </p>
                        <p className="text-xs text-medium-gray">
                          {e.category} &middot;{" "}
                          <span className="capitalize">{e.role}</span>
                        </p>
                      </div>
                      <ActivitySparkline endeavorId={e.id} />
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono text-xs font-bold ${
                            statusColors[e.status] || "text-medium-gray"
                          }`}
                        >
                          {statusIcons[e.status] || "?"}
                        </span>
                        <span className="text-xs text-medium-gray capitalize">
                          {e.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* ── pending tasks ─────────────────────────── */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// pending tasks"}
                </h2>
                {data.pendingTasks.length > 0 && (
                  <span className="text-xs text-medium-gray">
                    {data.pendingTasks.length} remaining
                  </span>
                )}
              </div>
              {data.pendingTasks.length === 0 ? (
                <div className="border border-medium-gray/20 p-8 text-center">
                  <p className="text-sm text-medium-gray">
                    No pending tasks assigned to you.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.pendingTasks.map((t) => (
                    <Link
                      key={t.id}
                      href={`/endeavors/${t.endeavorId}`}
                      className="flex items-center gap-3 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                    >
                      <span
                        className={`font-mono text-sm font-bold ${
                          statusColors[t.status] || "text-medium-gray"
                        }`}
                      >
                        &gt;
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {t.title}
                        </p>
                        <p className="text-xs text-medium-gray">
                          {t.endeavorTitle} &middot;{" "}
                          <span className="capitalize">{t.status}</span>
                        </p>
                      </div>
                      {t.dueDate && (
                        <span
                          className={`shrink-0 text-xs font-mono ${
                            isDueOverdue(t.dueDate)
                              ? "text-red-400 font-semibold"
                              : isDueSoon(t.dueDate)
                                ? "text-yellow-400"
                                : "text-medium-gray"
                          }`}
                        >
                          {isDueOverdue(t.dueDate) ? "overdue " : "due "}
                          {new Date(t.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* ── recent notifications ──────────────────── */}
            {data.recentActivity.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// recent notifications"}
                  </h2>
                  <Link
                    href="/notifications"
                    className="text-xs text-code-blue hover:text-code-green transition-colors"
                  >
                    View all &rarr;
                  </Link>
                </div>
                <div className="space-y-1">
                  {data.recentActivity.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className={`flex items-start gap-3 border p-3 ${
                        a.read
                          ? "border-medium-gray/10 opacity-60"
                          : "border-medium-gray/20"
                      }`}
                    >
                      <span className="mt-0.5 font-mono text-sm font-bold text-code-blue">
                        {activityIcons[a.type] || ">"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-light-gray">{a.message}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs text-medium-gray">
                            {formatTimeAgo(a.createdAt)}
                          </span>
                          {a.endeavorId && (
                            <Link
                              href={`/endeavors/${a.endeavorId}`}
                              className="text-xs text-code-blue hover:text-code-green transition-colors"
                            >
                              View &rarr;
                            </Link>
                          )}
                        </div>
                      </div>
                      {!a.read && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-code-green" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── insights ─────────────────────────── */}
            <section className="mb-10">
              <DashboardInsights />
            </section>

            {/* ── streak + goals ─────────────────────── */}
            <section className="mb-10 grid gap-4 sm:grid-cols-2">
              <ActivityStreak />
              <WeeklyGoals />
            </section>

            {/* ── recent activity summary ──────────────── */}
            <section className="mb-10">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// activity summary"}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-lg font-bold">{data.stats.tasksCompleted}</p>
                  <p className="text-xs text-medium-gray">tasks completed</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-lg font-bold">{data.stats.discussionsPosted}</p>
                  <p className="text-xs text-medium-gray">discussions</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-lg font-bold">{data.stats.storiesWritten}</p>
                  <p className="text-xs text-medium-gray">stories written</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-lg font-bold">
                    {data.statusCounts["completed"] || 0}
                  </p>
                  <p className="text-xs text-medium-gray">endeavors completed</p>
                </div>
              </div>
            </section>

            {/* ── quick actions ─────────────────────────── */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// quick actions"}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Link
                  href="/endeavors/create"
                  className="border border-medium-gray/20 p-4 text-center transition-colors hover:border-code-green/30"
                >
                  <span className="block text-lg font-bold text-code-green mb-1">
                    +
                  </span>
                  <span className="text-xs text-medium-gray">Create</span>
                </Link>
                <Link
                  href="/feed"
                  className="border border-medium-gray/20 p-4 text-center transition-colors hover:border-code-green/30"
                >
                  <span className="block text-lg font-bold text-code-blue mb-1">
                    &gt;
                  </span>
                  <span className="text-xs text-medium-gray">Explore</span>
                </Link>
                <Link
                  href="/messages"
                  className="border border-medium-gray/20 p-4 text-center transition-colors hover:border-code-green/30"
                >
                  <span className="block text-lg font-bold text-code-blue mb-1">
                    @
                  </span>
                  <span className="text-xs text-medium-gray">Messages</span>
                </Link>
                <Link
                  href="/profile"
                  className="border border-medium-gray/20 p-4 text-center transition-colors hover:border-code-green/30"
                >
                  <span className="block text-lg font-bold text-light-gray mb-1">
                    ~
                  </span>
                  <span className="text-xs text-medium-gray">Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="border border-medium-gray/20 p-4 text-center transition-colors hover:border-code-green/30"
                >
                  <span className="block text-lg font-bold text-medium-gray mb-1">
                    *
                  </span>
                  <span className="text-xs text-medium-gray">Settings</span>
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
