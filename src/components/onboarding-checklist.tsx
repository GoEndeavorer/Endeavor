"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ChecklistItem = {
  key: string;
  label: string;
  href: string;
  check: (data: ChecklistData) => boolean;
};

type ChecklistData = {
  hasProfile: boolean;
  hasSkills: boolean;
  hasBio: boolean;
  hasEndeavor: boolean;
  hasJoined: boolean;
  hasDiscussion: boolean;
  hasFollowed: boolean;
};

const items: ChecklistItem[] = [
  { key: "profile", label: "Complete your profile", href: "/profile", check: (d) => d.hasProfile },
  { key: "skills", label: "Add your skills", href: "/settings", check: (d) => d.hasSkills },
  { key: "bio", label: "Write a bio", href: "/settings", check: (d) => d.hasBio },
  { key: "create", label: "Create an endeavor", href: "/endeavors/create", check: (d) => d.hasEndeavor },
  { key: "join", label: "Join an endeavor", href: "/discover", check: (d) => d.hasJoined },
  { key: "discuss", label: "Post in a discussion", href: "/feed", check: (d) => d.hasDiscussion },
  { key: "follow", label: "Follow someone", href: "/people", check: (d) => d.hasFollowed },
];

export function OnboardingChecklist() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("endeavor-checklist-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    fetch("/api/dashboard/checklist")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (dismissed || !data) return null;

  const completed = items.filter((item) => item.check(data)).length;
  const total = items.length;
  const percent = Math.round((completed / total) * 100);

  // Don't show if all completed
  if (completed === total) return null;

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("endeavor-checklist-dismissed", "1");
  }

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// getting started"}
        </h4>
        <button
          onClick={dismiss}
          className="text-xs text-medium-gray hover:text-light-gray transition-colors"
        >
          dismiss
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 bg-medium-gray/10">
          <div
            className="h-full bg-code-green transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs font-mono text-code-green">{completed}/{total}</span>
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const done = item.check(data);
          return (
            <Link
              key={item.key}
              href={done ? "#" : item.href}
              className={`flex items-center gap-2 py-1 text-xs transition-colors ${
                done
                  ? "text-medium-gray/50 line-through cursor-default"
                  : "text-light-gray hover:text-code-green"
              }`}
            >
              <span className={`font-mono ${done ? "text-code-green" : "text-medium-gray"}`}>
                {done ? "[x]" : "[ ]"}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
