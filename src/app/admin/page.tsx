"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";

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

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    ])
      .then(([reportsData, statsData]) => {
        setReports(reportsData);
        setStats(statsData);
      })
      .catch((err) => {
        setError(err.message === "Forbidden" ? "You do not have admin access." : "Failed to load data.");
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
      setReports(reports.map((r) => (r.id === reportId ? { ...r, status } : r)));
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

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

        {/* Platform Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="border border-medium-gray/30 p-4 text-center">
              <p className="text-2xl font-bold text-code-green">{stats.totalEndeavors}</p>
              <p className="text-xs text-medium-gray">Endeavors</p>
            </div>
            <div className="border border-medium-gray/30 p-4 text-center">
              <p className="text-2xl font-bold text-code-blue">{stats.totalUsers}</p>
              <p className="text-xs text-medium-gray">Users</p>
            </div>
            <div className="border border-medium-gray/30 p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.totalMembers}</p>
              <p className="text-xs text-medium-gray">Memberships</p>
            </div>
            <div className="border border-medium-gray/30 p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{pendingReports.length}</p>
              <p className="text-xs text-medium-gray">Pending Reports</p>
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {stats && stats.categories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// categories"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {stats.categories.map((c) => (
                <div key={c.category} className="border border-medium-gray/30 px-4 py-2">
                  <span className="text-sm font-semibold">{c.category}</span>
                  <span className="ml-2 text-sm text-medium-gray">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Reports */}
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">
            {"// pending reports"} ({pendingReports.length})
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
                        Mark Reviewed
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
                    <p className="mb-2 text-xs text-light-gray">{r.details}</p>
                  )}
                  <p className="text-xs text-medium-gray">
                    Reported by {r.reporterName} ({r.reporterEmail}) on{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
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
              {"// resolved reports"} ({resolvedReports.length})
            </h2>
            <div className="space-y-2">
              {resolvedReports.map((r) => (
                <div key={r.id} className="border border-medium-gray/20 p-3 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm">{r.reason}</span>
                      {r.endeavorTitle && (
                        <span className="ml-2 text-xs text-medium-gray">
                          ({r.endeavorTitle})
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${r.status === "reviewed" ? "text-code-green" : "text-medium-gray"}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
