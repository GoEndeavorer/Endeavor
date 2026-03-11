"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

export const dynamic = "force-dynamic";

const NOTIFICATION_TYPES = [
  {
    type: "join_request",
    label: "Join Requests",
    description: "When someone requests to join your endeavor",
    icon: "+",
  },
  {
    type: "member_joined",
    label: "Member Joined",
    description: "When a new member joins your endeavor",
    icon: "+",
  },
  {
    type: "new_discussion",
    label: "New Discussion",
    description: "When a new discussion is posted in your endeavor",
    icon: "#",
  },
  {
    type: "task_assigned",
    label: "Task Assigned",
    description: "When a task is assigned to you",
    icon: ">",
  },
  {
    type: "funding_received",
    label: "Funding Received",
    description: "When your endeavor receives funding",
    icon: "$",
  },
  {
    type: "milestone_completed",
    label: "Milestone Completed",
    description: "When a milestone is completed in your endeavor",
    icon: "*",
  },
  {
    type: "status_change",
    label: "Status Change",
    description: "When an endeavor you follow changes status",
    icon: "~",
  },
  {
    type: "update_posted",
    label: "Update Posted",
    description: "When an update is posted in your endeavor",
    icon: "!",
  },
] as const;

type TypePreferences = Record<string, boolean>;

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<TypePreferences>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/notification-preferences")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.typePreferences) {
            setPreferences(data.typePreferences);
          } else {
            // Default all to true
            const defaults: TypePreferences = {};
            for (const t of NOTIFICATION_TYPES) {
              defaults[t.type] = true;
            }
            setPreferences(defaults);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  const togglePreference = useCallback(
    async (type: string) => {
      const newValue = !preferences[type];
      setUpdating(type);
      setPreferences((prev) => ({ ...prev, [type]: newValue }));

      try {
        const res = await fetch("/api/notification-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, enabled: newValue }),
        });

        if (!res.ok) {
          // Revert on failure
          setPreferences((prev) => ({ ...prev, [type]: !newValue }));
          toast("Failed to update preference", "error");
        } else {
          toast(
            newValue ? "Notification enabled" : "Notification disabled"
          );
        }
      } catch {
        setPreferences((prev) => ({ ...prev, [type]: !newValue }));
        toast("Failed to update preference", "error");
      } finally {
        setUpdating(null);
      }
    },
    [preferences, toast]
  );

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  const enabledCount = Object.values(preferences).filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{
          label: "Notification Settings",
          href: "/notifications/settings",
        }}
      />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold font-mono">
            <span className="text-code-green">//</span> Notification Settings
          </h1>
          <p className="mt-2 text-xs text-medium-gray font-mono">
            Configure which notifications you receive. Toggle each type on or
            off.
          </p>
        </div>

        {/* Summary bar */}
        <div className="mb-6 flex items-center justify-between border border-medium-gray/20 px-4 py-3">
          <span className="text-xs font-mono text-medium-gray">
            {enabledCount} of {NOTIFICATION_TYPES.length} types enabled
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => {
                for (const t of NOTIFICATION_TYPES) {
                  if (!preferences[t.type]) {
                    togglePreference(t.type);
                  }
                }
              }}
              className="text-xs font-mono text-code-green hover:text-white transition-colors"
            >
              Enable all
            </button>
            <button
              onClick={() => {
                for (const t of NOTIFICATION_TYPES) {
                  if (preferences[t.type]) {
                    togglePreference(t.type);
                  }
                }
              }}
              className="text-xs font-mono text-medium-gray hover:text-white transition-colors"
            >
              Disable all
            </button>
          </div>
        </div>

        {/* Notification type toggles */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="border border-medium-gray/10 p-4 animate-pulse"
              >
                <div className="h-4 w-1/3 bg-medium-gray/20 mb-2" />
                <div className="h-3 w-2/3 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {NOTIFICATION_TYPES.map((item) => {
              const enabled = preferences[item.type] ?? true;
              const isUpdating = updating === item.type;

              return (
                <div
                  key={item.type}
                  className={`flex items-center justify-between border p-4 transition-colors ${
                    enabled
                      ? "border-medium-gray/20 hover:border-code-green/30"
                      : "border-medium-gray/10 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-0.5 text-sm font-mono font-bold ${
                        enabled ? "text-code-green" : "text-medium-gray"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm font-mono text-light-gray">
                        {item.label}
                      </p>
                      <p className="text-xs font-mono text-medium-gray mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => togglePreference(item.type)}
                    disabled={isUpdating}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center border transition-colors ${
                      enabled
                        ? "border-code-green/50 bg-code-green/20"
                        : "border-medium-gray/30 bg-medium-gray/10"
                    } ${isUpdating ? "opacity-50" : ""}`}
                    aria-label={`Toggle ${item.label}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform transition-transform ${
                        enabled
                          ? "translate-x-[18px] bg-code-green"
                          : "translate-x-[3px] bg-medium-gray"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Type code reference */}
        <div className="mt-8 border border-medium-gray/20 p-4">
          <p className="text-xs font-mono text-code-green mb-2">
            // notification type reference
          </p>
          <div className="grid grid-cols-2 gap-1">
            {NOTIFICATION_TYPES.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <span className="text-xs font-mono text-medium-gray/50">
                  {item.icon}
                </span>
                <span className="text-xs font-mono text-medium-gray">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
