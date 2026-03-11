"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
  action: string;
  actionLabel: string;
};

type CreatorChecklistProps = {
  endeavorId: string;
  hasDescription: boolean;
  hasImage: boolean;
  hasNeeds: boolean;
  memberCount: number;
  taskCount: number;
  milestoneCount: number;
  hasUpdate: boolean;
};

export function CreatorChecklist({
  endeavorId,
  hasDescription,
  hasImage,
  hasNeeds,
  memberCount,
  taskCount,
  milestoneCount,
  hasUpdate,
}: CreatorChecklistProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const key = `endeavor_checklist_${endeavorId}`;
      if (localStorage.getItem(key) === "dismissed") {
        setDismissed(true);
      }
    } catch {}
  }, [endeavorId]);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(`endeavor_checklist_${endeavorId}`, "dismissed");
    } catch {}
  }

  const items: ChecklistItem[] = [
    {
      id: "description",
      label: "Write a detailed description",
      completed: hasDescription,
      action: `/endeavors/${endeavorId}/dashboard?tab=settings`,
      actionLabel: "Edit",
    },
    {
      id: "image",
      label: "Add a cover image",
      completed: hasImage,
      action: `/endeavors/${endeavorId}/dashboard?tab=settings`,
      actionLabel: "Upload",
    },
    {
      id: "needs",
      label: "List what skills you need",
      completed: hasNeeds,
      action: `/endeavors/${endeavorId}/dashboard?tab=settings`,
      actionLabel: "Add",
    },
    {
      id: "milestone",
      label: "Create your first milestone",
      completed: milestoneCount > 0,
      action: `/endeavors/${endeavorId}/dashboard?tab=milestones`,
      actionLabel: "Create",
    },
    {
      id: "task",
      label: "Add tasks to get organized",
      completed: taskCount > 0,
      action: `/endeavors/${endeavorId}/dashboard?tab=tasks`,
      actionLabel: "Add",
    },
    {
      id: "update",
      label: "Post an update for your team",
      completed: hasUpdate,
      action: `/endeavors/${endeavorId}/dashboard?tab=updates`,
      actionLabel: "Post",
    },
    {
      id: "members",
      label: "Invite team members",
      completed: memberCount > 1,
      action: `/endeavors/${endeavorId}/dashboard?tab=members`,
      actionLabel: "Invite",
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  if (dismissed || progress === 100) return null;

  return (
    <div className="mb-6 border border-code-green/30 bg-code-green/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-code-green">Getting Started</h3>
          <p className="text-xs text-medium-gray">
            {completedCount}/{items.length} completed
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-xs text-medium-gray hover:text-white"
        >
          Dismiss
        </button>
      </div>
      <div className="mb-4 h-1.5 w-full bg-medium-gray/20">
        <div
          className="h-1.5 bg-code-green transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-1"
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-4 w-4 items-center justify-center border text-[10px] font-mono ${
                  item.completed
                    ? "border-code-green bg-code-green text-black"
                    : "border-medium-gray/30"
                }`}
              >
                {item.completed ? "✓" : ""}
              </span>
              <span
                className={`text-sm ${
                  item.completed
                    ? "text-medium-gray line-through"
                    : "text-light-gray"
                }`}
              >
                {item.label}
              </span>
            </div>
            {!item.completed && (
              <Link
                href={item.action}
                className="text-xs text-code-blue hover:text-code-green"
              >
                {item.actionLabel} &rarr;
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
