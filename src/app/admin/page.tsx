"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporterName: string;
  reporterEmail: string;
  endeavorId: string | null;
  endeavorTitle: string | null;
};

type Stats = {
  categories: { category: string; count: number }[];
  totalEndeavors: number;
  totalUsers: number;
  totalMembers: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  endeavorCount: number;
  createdCount: number;
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "reports" | "users">("overview");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    Promise.all([
      fetch("/api/admin/reports").then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      }),
      fetch("/api/endeavors/stats").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([reportsData, statsData, usersData]) => {
        setReports(reportsData);
        setStats(statsData);
        if (Array.isArray(usersData)) setUsers(usersData);
      })
      .catch((err) => {
        setError(
          err.message === "Forbidden"
            ? "You do not have admin access."
            : "Failed to load data."
        );
      })
      .finally(() => setLoading(false));
  }, [session]);

  async function updateReport(reportId: string, status: string) {
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    if (res.ok) {
      setReports(
        reports.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-400">{error}</p>
          <Link href="/" className="text-code-blue hover:text-code-green">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === "pending");
  const resolvedReports = reports.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Admin", href: "/admin" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { id: "overview" as const, label: "Overview" },
            {
              id: "reports" as const,
              label: `Reports (${pendingReports.length})`,
            },
            { id: "users" as const, label: `Users (${users.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                tab === t.id
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && stats && (
          <div>
            {/* Platform Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="border border-medium-gray/30 p-5 text-center">
                <p className="text-3xl font-bold text-code-green">
                  {stats.totalEndeavors}
                </p>
                <p className="text-xs text-medium-gray">Endeavors</p>
              </div>
              <div className="border border-medium-gray/30 p-5 text-center">
                <p className="text-3xl font-bold text-code-blue">
                  {stats.totalUsers}
                </p>
                <p className="text-xs text-medium-gray">Users</p>
              </div>
              <div className="border border-medium-gray/30 p-5 text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {stats.totalMembers}
                </p>
                <p className="text-xs text-medium-gray">Memberships</p>
              </div>
              <div className="border border-medium-gray/30 p-5 text-center">
                <p className="text-3xl font-bold text-red-400">
                  {pendingReports.length}
                </p>
                <p className="text-xs text-medium-gray">Pending Reports</p>
              </div>
            </div>

            {/* Category breakdown */}
            {stats.categories.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// categories"}
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {stats.categories.map((c) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between border border-medium-gray/30 px-4 py-3"
                    >
                      <span className="text-sm font-semibold">
                        {c.category}
                      </span>
                      <span className="text-lg font-bold text-code-green">
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent users preview */}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-blue">
                {"// recent users"}
              </h2>
              <div className="space-y-1">
                {users.slice(0, 5).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between border border-medium-gray/20 px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center bg-accent text-xs font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/users/${u.id}`}
                          className="text-sm font-semibold hover:text-code-green"
                        >
                          {u.name}
                        </Link>
                        <p className="text-xs text-medium-gray">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-medium-gray">
                      {formatTimeAgo(u.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
              {users.length > 5 && (
                <button
                  onClick={() => setTab("users")}
                  className="mt-2 text-xs text-code-blue hover:text-code-green"
                >
                  View all {users.length} users &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tab === "reports" && (
          <div>
            {/* Pending Reports */}
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">
                {"// pending"} ({pendingReports.length})
              </h2>
              {pendingReports.length === 0 ? (
                <div className="border border-medium-gray/20 p-6 text-center text-sm text-medium-gray">
                  No pending reports. All clear.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReports.map((r) => (
                    <div key={r.id} className="border border-red-500/30 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-red-400">
                            {r.reason}
                          </p>
                          {r.endeavorTitle && (
                            <Link
                              href={`/endeavors/${r.endeavorId}`}
                              className="text-xs text-code-blue hover:text-code-green"
                            >
                              {r.endeavorTitle}
                            </Link>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReport(r.id, "reviewed")}
                            className="border border-code-green px-3 py-1 text-xs text-code-green hover:bg-code-green hover:text-black"
                          >
                            Reviewed
                          </button>
                          <button
                            onClick={() => updateReport(r.id, "dismissed")}
                            className="border border-medium-gray/50 px-3 py-1 text-xs text-medium-gray hover:text-white"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                      {r.details && (
                        <p className="mb-2 text-xs text-light-gray">
                          {r.details}
                        </p>
                      )}
                      <p className="text-xs text-medium-gray">
                        Reported by {r.reporterName} ({r.reporterEmail}){" "}
                        &middot; {formatTimeAgo(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved Reports */}
            {resolvedReports.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-medium-gray">
                  {"// resolved"} ({resolvedReports.length})
                </h2>
                <div className="space-y-2">
                  {resolvedReports.map((r) => (
                    <div
                      key={r.id}
                      className="border border-medium-gray/20 p-3 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm">{r.reason}</span>
                          {r.endeavorTitle && (
                            <span className="ml-2 text-xs text-medium-gray">
                              ({r.endeavorTitle})
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            r.status === "reviewed"
                              ? "text-code-green"
                              : "text-medium-gray"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-blue">
              {"// all users"} ({users.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-medium-gray/30 text-left text-xs text-medium-gray">
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2 text-center">Created</th>
                    <th className="px-3 py-2 text-center">Joined</th>
                    <th className="px-3 py-2">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-medium-gray/10 transition-colors hover:bg-code-green/5"
                    >
                      <td className="px-3 py-3">
                        <Link
                          href={`/users/${u.id}`}
                          className="font-semibold hover:text-code-green"
                        >
                          {u.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-medium-gray">{u.email}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-code-green font-semibold">
                          {u.createdCount}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-code-blue font-semibold">
                          {u.endeavorCount}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-medium-gray">
                        {formatTimeAgo(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
