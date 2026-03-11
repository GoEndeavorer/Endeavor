"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useSession } from "@/lib/auth-client";
import { formatTimeAgo } from "@/lib/time";

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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/dashboard")
        .then((r) => (r.ok ? r.json() : null))
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Dashboard", href: "/dashboard" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-xl font-bold">
            Welcome back, {session.user.name}
          </h1>
          <p className="mt-1 text-sm text-medium-gray">{today}</p>
          {data && data.unreadNotifications > 0 && (
            <Link
              href="/notifications"
              className="mt-2 inline-block border border-code-green/30 bg-code-green/10 px-3 py-1 text-xs text-code-green hover:bg-code-green/20 transition-colors"
            >
              {data.unreadNotifications} unread notification
              {data.unreadNotifications !== 1 ? "s" : ""}
            </Link>
          )}
        </div>

        {loading || !data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-medium-gray/20 p-4">
                  <div className="h-3 w-20 animate-pulse bg-medium-gray/10 mb-3" />
                  <div className="h-8 w-12 animate-pulse bg-medium-gray/10" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse bg-medium-gray/10"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Row */}
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
                  {"// tasks done"}
                </p>
                <p className="text-2xl font-bold">{data.stats.tasksCompleted}</p>
                <p className="mt-1 text-xs text-medium-gray">
                  {data.pendingTasks.length} pending
                </p>
              </div>
              <div className="border border-medium-gray/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
                  {"// discussions"}
                </p>
                <p className="text-2xl font-bold">
                  {data.stats.discussionsPosted}
                </p>
                <p className="mt-1 text-xs text-medium-gray">posts</p>
              </div>
              <div className="border border-medium-gray/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
                  {"// stories"}
                </p>
                <p className="text-2xl font-bold">{data.stats.storiesWritten}</p>
                <p className="mt-1 text-xs text-medium-gray">written</p>
              </div>
            </div>

            {/* Your Endeavors */}
            <section className="mb-10">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// your endeavors"}
              </h2>
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

            {/* Pending Tasks */}
            <section className="mb-10">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// pending tasks"}
              </h2>
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
                        <span className="shrink-0 text-xs text-medium-gray">
                          Due{" "}
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

            {/* Recent Activity */}
            {data.recentActivity.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// recent activity"}
                </h2>
                <div className="space-y-1">
                  {data.recentActivity.map((a) => (
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
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Actions */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// quick actions"}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                  href="/profile"
                  className="border border-medium-gray/20 p-4 text-center transition-colors hover:border-code-green/30"
                >
                  <span className="block text-lg font-bold text-light-gray mb-1">
                    @
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
