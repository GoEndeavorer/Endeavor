"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/toast";

type Preferences = {
  emailDigest: boolean;
  emailMilestones: boolean;
  emailDiscussions: boolean;
  emailJoinRequests: boolean;
};

const preferenceItems: { key: keyof Preferences; label: string; description: string }[] = [
  { key: "emailDigest", label: "weekly digest", description: "summary of activity across your endeavors" },
  { key: "emailMilestones", label: "milestone updates", description: "when milestones are completed or created" },
  { key: "emailDiscussions", label: "discussion replies", description: "new replies in discussions you follow" },
  { key: "emailJoinRequests", label: "join requests", description: "when someone requests to join your endeavor" },
];

export function EmailPreferences() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<keyof Preferences | null>(null);

  useEffect(() => {
    fetch("/api/notification-preferences")
      .then((res) => res.json())
      .then((data) => {
        setPrefs({
          emailDigest: data.emailDigest,
          emailMilestones: data.emailMilestones,
          emailDiscussions: data.emailDiscussions,
          emailJoinRequests: data.emailJoinRequests,
        });
      })
      .catch(() => {
        toast("failed to load preferences", "error");
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const toggle = useCallback(
    async (key: keyof Preferences) => {
      if (!prefs) return;

      const newValue = !prefs[key];
      setPrefs((prev) => (prev ? { ...prev, [key]: newValue } : prev));
      setSaving(key);

      try {
        const res = await fetch("/api/notification-preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [key]: newValue }),
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setPrefs({
          emailDigest: data.emailDigest,
          emailMilestones: data.emailMilestones,
          emailDiscussions: data.emailDiscussions,
          emailJoinRequests: data.emailJoinRequests,
        });
        toast("preferences updated", "success");
      } catch {
        setPrefs((prev) => (prev ? { ...prev, [key]: !newValue } : prev));
        toast("failed to save preference", "error");
      } finally {
        setSaving(null);
      }
    },
    [prefs, toast]
  );

  if (loading) {
    return (
      <div className="space-y-4 font-mono text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// email notifications"}
        </h3>
        <p className="text-medium-gray">loading...</p>
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="space-y-4 font-mono text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// email notifications"}
        </h3>
        <p className="text-medium-gray">unable to load preferences</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// email notifications"}
      </h3>

      <div className="space-y-3">
        {preferenceItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between border border-medium-gray/20 bg-black px-4 py-3"
          >
            <div>
              <p className="text-code-green">{item.label}</p>
              <p className="text-xs text-medium-gray">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              disabled={saving === item.key}
              className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                prefs[item.key]
                  ? "border-code-green/50 bg-code-green/20"
                  : "border-medium-gray/50 bg-medium-gray/10"
              } ${saving === item.key ? "opacity-50" : ""}`}
              aria-label={`toggle ${item.label}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform ${
                  prefs[item.key] ? "translate-x-5 bg-code-green" : "translate-x-0 bg-medium-gray"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
