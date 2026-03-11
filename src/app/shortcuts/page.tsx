"use client";

import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Shortcut = {
  keys: string[];
  description: string;
};

type ShortcutGroup = {
  title: string;
  shortcuts: Shortcut[];
};

const groups: ShortcutGroup[] = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Open command palette" },
      { keys: ["Ctrl", "/"], description: "Open search" },
      { keys: ["Esc"], description: "Close modal / panel" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "H"], description: "Go to Home" },
      { keys: ["G", "F"], description: "Go to Feed" },
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "M"], description: "Go to Messages" },
      { keys: ["G", "N"], description: "Go to Notifications" },
      { keys: ["G", "S"], description: "Go to Settings" },
      { keys: ["G", "P"], description: "Go to Profile" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["C"], description: "Create new endeavor" },
      { keys: ["N"], description: "New story" },
      { keys: ["T"], description: "Quick task" },
      { keys: ["B"], description: "Toggle bookmark" },
      { keys: ["L"], description: "Toggle like / upvote" },
    ],
  },
  {
    title: "Feed & Lists",
    shortcuts: [
      { keys: ["J"], description: "Next item" },
      { keys: ["K"], description: "Previous item" },
      { keys: ["Enter"], description: "Open selected item" },
      { keys: ["R"], description: "Refresh list" },
    ],
  },
  {
    title: "Editing",
    shortcuts: [
      { keys: ["Ctrl", "Enter"], description: "Submit form" },
      { keys: ["Ctrl", "S"], description: "Save draft" },
      { keys: ["Tab"], description: "Next field" },
      { keys: ["Shift", "Tab"], description: "Previous field" },
    ],
  },
];

export default function ShortcutsPage() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Shortcuts", href: "/shortcuts" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-1">Keyboard Shortcuts</h1>
        <p className="text-sm text-medium-gray mb-8">Navigate faster with keyboard shortcuts</p>

        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
                {"// " + group.title.toLowerCase()}
              </h2>
              <div className="border border-medium-gray/20 divide-y divide-medium-gray/10">
                {group.shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-light-gray">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <span key={j}>
                          {j > 0 && <span className="text-medium-gray mx-0.5">+</span>}
                          <kbd className="px-2 py-0.5 text-xs font-mono bg-medium-gray/10 border border-medium-gray/30 text-medium-gray">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
