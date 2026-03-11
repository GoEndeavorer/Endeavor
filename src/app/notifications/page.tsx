"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";
import { useToast } from "@/components/toast";

export const dynamic = "force-dynamic";

type Notification = {
  id: string;
  type: string;
  message: string;
  endeavorId: string | null;
  read: boolean;
  createdAt: string;
};

const typeIcons: Record<string, string> = {
  join_request: "+",
  member_joined: "+",
  new_discussion: "#",
  task_assigned: ">",
  funding_received: "$",
  milestone_completed: "*",
  status_change: "~",
  update_posted: "!",
  member_left: "-",
  direct_message: "@",
};

const typeColors: Record<string, string> = {
  join_request: "text-code-green",
  member_joined: "text-code-green",
  new_discussion: "text-code-blue",
  task_assigned: "text-yellow-400",
  funding_received: "text-purple-400",
  milestone_completed: "text-code-green",
  status_change: "text-code-blue",
  update_posted: "text-yellow-400",
  member_left: "text-red-400",
  direct_message: "text-purple-400",
};

type PrimaryTab = "all" | "unread" | "mentions" | "system";

const primaryTabLabels: Record<PrimaryTab, string> = {
  all: "All",
  unread: "Unread",
  mentions: "Mentions",
  system: "System",
};

const mentionTypes = ["direct_message", "new_discussion"];
const systemTypes = ["status_change", "milestone_completed", "member_joined", "member_left"];

type TypeFilter =
  | "all"
  | "join_requests"
  | "discussions"
  | "milestones"
  | "updates"
  | "tasks"
  | "funding"
  | "members"
  | "messages";

const typeFilterMap: Record<TypeFilter, string[]> = {
  all: [],
  join_requests: ["join_request"],
  discussions: ["new_discussion"],
  milestones: ["milestone_completed"],
  updates: ["update_posted", "status_change"],
  tasks: ["task_assigned"],
  funding: ["funding_received"],
  members: ["member_joined", "member_left"],
  messages: ["direct_message"],
};

const typeFilterLabels: Record<TypeFilter, string> = {
  all: "All",
  join_requests: "Join Requests",
  discussions: "Discussions",
  milestones: "Milestones",
  updates: "Updates",
  tasks: "Tasks",
  funding: "Funding",
  members: "Members",
  messages: "Messages",
};

type DateGroup = "today" | "yesterday" | "this_week" | "earlier";

function getDateGroup(dateStr: string): DateGroup {
  const now = new Date();
  const date = new Date(dateStr);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfToday.getDay());

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  if (date >= startOfWeek) return "this_week";
  return "earlier";
}

const dateGroupLabels: Record<DateGroup, string> = {
  today: "// Today",
  yesterday: "// Yesterday",
  this_week: "// This Week",
  earlier: "// Earlier",
};

const dateGroupOrder: DateGroup[] = ["today", "yesterday", "this_week", "earlier"];

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : []))
        .then(setNotifications)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const displayed = useMemo(() => {
    let result = notifications;

    if (readFilter === "unread") {
      result = result.filter((n) => !n.read);
    }

    if (typeFilter !== "all") {
      const types = typeFilterMap[typeFilter];
      result = result.filter((n) => types.includes(n.type));
    }

    return result;
  }, [notifications, readFilter, typeFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<DateGroup, Notification[]> = {
      today: [],
      yesterday: [],
      this_week: [],
      earlier: [],
    };

    for (const n of displayed) {
      const group = getDateGroup(n.createdAt);
      groups[group].push(n);
    }

    return groups;
  }, [displayed]);

  // Count how many type filters have notifications (for showing/hiding filters)
  const availableTypeFilters = useMemo(() => {
    const typesPresent = new Set(notifications.map((n) => n.type));
    const available: TypeFilter[] = ["all"];
    for (const [filter, types] of Object.entries(typeFilterMap)) {
      if (filter === "all") continue;
      if (types.some((t) => typesPresent.has(t))) {
        available.push(filter as TypeFilter);
      }
    }
    return available;
  }, [notifications]);

  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read");
  }

  async function markRead(id: string) {
    await fetch("/api/notifications/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast("Marked as read");
  }

  async function batchMarkRead() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    await fetch("/api/notifications/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (selected.has(n.id) ? { ...n, read: true } : n))
    );
    toast(`${ids.length} notification${ids.length > 1 ? "s" : ""} marked as read`);
    setSelected(new Set());
    setSelectMode(false);
  }

  async function batchDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    await fetch("/api/notifications/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids }),
    });
    setNotifications((prev) => prev.filter((n) => !selected.has(n.id)));
    toast(`${ids.length} notification${ids.length > 1 ? "s" : ""} deleted`);
    setSelected(new Set());
    setSelectMode(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(displayed.map((n) => n.id)));
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  function renderNotification(n: Notification) {
    const icon = typeIcons[n.type] || ">";
    const color = typeColors[n.type] || "text-medium-gray";
    const time = new Date(n.createdAt);
    const ago = formatTimeAgo(time);

    return (
      <div
        key={n.id}
        className={`flex items-start gap-3 border p-3 transition-colors cursor-pointer ${
          n.read
            ? "border-medium-gray/10 opacity-60"
            : "border-medium-gray/30 hover:border-code-green/30"
        } ${selected.has(n.id) ? "bg-code-green/5 border-code-green/30" : ""}`}
        onClick={() => {
          if (selectMode) {
            toggleSelect(n.id);
          } else if (!n.read) {
            markRead(n.id);
          }
        }}
      >
        {selectMode && (
          <div className="mt-0.5 shrink-0">
            <div
              className={`h-4 w-4 border flex items-center justify-center text-xs ${
                selected.has(n.id)
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50"
              }`}
            >
              {selected.has(n.id) && "✓"}
            </div>
          </div>
        )}
        <span className={`mt-0.5 text-sm font-mono font-bold ${color}`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-light-gray">{n.message}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-medium-gray">{ago}</span>
            {n.endeavorId && (
              <Link
                href={`/endeavors/${n.endeavorId}`}
                className="text-xs text-code-blue hover:text-code-green"
                onClick={(e) => e.stopPropagation()}
              >
                View endeavor &rarr;
              </Link>
            )}
          </div>
        </div>
        {!selectMode && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            {!n.read && (
              <span className="h-2 w-2 bg-code-green" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetch("/api/notifications/batch", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "delete", ids: [n.id] }),
                });
                setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                toast("Notification deleted");
              }}
              className="text-xs text-medium-gray/50 hover:text-red-400"
            >
              x
            </button>
          </div>
        )}
      </div>
    );
  }

  const hasGroups = dateGroupOrder.some(
    (g) => groupedNotifications[g].length > 0
  );

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Notifications", href: "/notifications" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-code-green/10 border border-code-green/30 px-2 py-0.5 text-xs text-code-green">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => setReadFilter("all")}
                className={`px-3 py-1 text-xs transition-colors ${
                  readFilter === "all"
                    ? "bg-code-green/10 text-code-green border border-code-green/30"
                    : "text-medium-gray hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setReadFilter("unread")}
                className={`px-3 py-1 text-xs transition-colors ${
                  readFilter === "unread"
                    ? "bg-code-green/10 text-code-green border border-code-green/30"
                    : "text-medium-gray hover:text-white"
                }`}
              >
                Unread
              </button>
            </div>
            <button
              onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
              className={`text-xs transition-colors ${
                selectMode ? "text-code-green" : "text-medium-gray hover:text-white"
              }`}
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
            {unreadCount > 0 && !selectMode && (
              <button
                onClick={markAllRead}
                className="text-xs text-code-blue hover:text-code-green transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Type filter tabs */}
        {availableTypeFilters.length > 2 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {availableTypeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  typeFilter === f
                    ? "bg-code-blue/10 text-code-blue border border-code-blue/30"
                    : "text-medium-gray hover:text-white border border-transparent"
                }`}
              >
                {typeFilterLabels[f]}
              </button>
            ))}
          </div>
        )}

        {/* Batch action bar */}
        {selectMode && (
          <div className="mb-4 flex items-center gap-3 border border-medium-gray/30 p-3">
            <span className="text-xs text-medium-gray">
              {selected.size} selected
            </span>
            <button
              onClick={selectAll}
              className="text-xs text-code-blue hover:text-code-green transition-colors"
            >
              Select all
            </button>
            <div className="flex-1" />
            <button
              onClick={batchMarkRead}
              disabled={selected.size === 0}
              className="text-xs text-code-blue hover:text-code-green transition-colors disabled:opacity-30"
            >
              Mark read
            </button>
            <button
              onClick={batchDelete}
              disabled={selected.size === 0}
              className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-30"
            >
              Delete
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-medium-gray/10 p-3 animate-pulse">
                <div className="h-4 w-3/4 bg-medium-gray/20 mb-2" />
                <div className="h-3 w-1/4 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        ) : !hasGroups ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-medium-gray text-sm">
              {readFilter === "unread"
                ? "No unread notifications."
                : typeFilter !== "all"
                  ? `No ${typeFilterLabels[typeFilter].toLowerCase()} notifications.`
                  : "No notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {dateGroupOrder.map((group) => {
              const items = groupedNotifications[group];
              if (items.length === 0) return null;

              return (
                <div key={group}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
                    {dateGroupLabels[group]}
                  </h2>
                  <div className="space-y-1">
                    {items.map(renderNotification)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
