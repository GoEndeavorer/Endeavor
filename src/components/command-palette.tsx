"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { QuickTaskModal } from "@/components/quick-task-modal";

type Command = {
  label: string;
  icon: string;
  action: string;
};

type CommandSection = {
  title: string;
  commands: Command[];
};

const sections: CommandSection[] = [
  {
    title: "Navigation",
    commands: [
      { label: "Home", icon: "~", action: "/" },
      { label: "Feed", icon: ">", action: "/feed" },
      { label: "Dashboard", icon: "#", action: "/dashboard" },
      { label: "Messages", icon: "@", action: "/messages" },
      { label: "Notifications", icon: "!", action: "/notifications" },
      { label: "Settings", icon: "%", action: "/settings" },
      { label: "Profile", icon: "&", action: "/profile" },
      { label: "Saved", icon: "*", action: "/saved" },
      { label: "Search", icon: "/", action: "/search" },
      { label: "Help", icon: "?", action: "/help" },
    ],
  },
  {
    title: "Create",
    commands: [
      { label: "New Endeavor", icon: "+", action: "/endeavors/create" },
      { label: "New Story", icon: "$", action: "/stories/new" },
      { label: "Quick Task", icon: "!", action: "__quick_task" },
    ],
  },
  {
    title: "Discover",
    commands: [
      { label: "Trending Topics", icon: "^", action: "/trending" },
      { label: "Discover", icon: "~", action: "/discover" },
      { label: "Categories", icon: "#", action: "/categories" },
      { label: "Leaderboard", icon: "=", action: "/leaderboard" },
      { label: "People", icon: "@", action: "/people" },
      { label: "Tags", icon: ".", action: "/tags" },
      { label: "Map", icon: "M", action: "/map" },
    ],
  },
  {
    title: "Quick Actions",
    commands: [
      { label: "View Changelog", icon: ".", action: "/changelog" },
      { label: "Weekly Digest", icon: "D", action: "/digest" },
      { label: "Analytics", icon: "%", action: "/analytics" },
      { label: "Achievements", icon: "*", action: "/achievements" },
      { label: "Collections", icon: "C", action: "/collections" },
      { label: "Mentorship", icon: "M", action: "/mentorship" },
      { label: "Events", icon: "E", action: "/events" },
      { label: "Goals", icon: "G", action: "/goals" },
      { label: "Feedback", icon: "F", action: "/feedback" },
      { label: "Skills", icon: "S", action: "/skills" },
      { label: "Q&A", icon: "Q", action: "/questions" },
      { label: "Messages", icon: "@", action: "/messages" },
      { label: "Referrals", icon: "R", action: "/referrals" },
      { label: "Challenges", icon: "!", action: "/challenges" },
      { label: "Groups", icon: "#", action: "/groups" },
      { label: "Invitations", icon: "I", action: "/invitations" },
      { label: "Media Library", icon: "M", action: "/media-library" },
      { label: "Audit Log", icon: ".", action: "/audit-log" },
      { label: "Automations", icon: "~", action: "/automations" },
      { label: "Notes", icon: "N", action: "/notes" },
    ],
  },
];

const allCommands = sections.flatMap((s) =>
  s.commands.map((c) => ({ ...c, section: s.title }))
);

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  const filteredSections = useMemo(() => {
    const grouped: { title: string; commands: (Command & { section: string; flatIndex: number })[] }[] = [];
    for (const section of sections) {
      const cmds = filtered
        .filter((c) => c.section === section.title)
        .map((c) => ({ ...c, flatIndex: 0 }));
      if (cmds.length > 0) {
        grouped.push({ title: section.title, commands: cmds });
      }
    }
    let idx = 0;
    for (const group of grouped) {
      for (const cmd of group.commands) {
        cmd.flatIndex = idx++;
      }
    }
    return grouped;
  }, [filtered]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Open on Ctrl/Cmd+P
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const executeCommand = useCallback(
    (command: (typeof allCommands)[number]) => {
      setOpen(false);
      if (command.action === "__quick_task") {
        setQuickTaskOpen(true);
        return;
      }
      if (command.action.startsWith("__")) {
        return;
      }
      router.push(command.action);
    },
    [router]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
      return;
    }
  }

  if (!open && !quickTaskOpen) return null;

  if (!open && quickTaskOpen) {
    return <QuickTaskModal onClose={() => setQuickTaskOpen(false)} />;
  }

  return (
    <>
    {quickTaskOpen && <QuickTaskModal onClose={() => setQuickTaskOpen(false)} />}
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/80 px-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg border border-medium-gray/30 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-medium-gray/20 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
            Command Palette
          </h2>
          <div className="flex items-center gap-2">
            <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-1.5 py-0.5 text-[10px] text-medium-gray">
              ESC
            </kbd>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-medium-gray hover:text-white"
            >
              close
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="border-b border-medium-gray/20 px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-medium-gray"
          />
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[40vh] overflow-y-auto scrollbar-none">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-medium-gray">
              No results
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.title}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-code-blue">
                    {section.title}
                  </span>
                </div>
                {section.commands.map((cmd) => (
                  <button
                    key={cmd.label}
                    data-selected={cmd.flatIndex === selectedIndex}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(cmd.flatIndex)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                      cmd.flatIndex === selectedIndex
                        ? "bg-code-green/10"
                        : "hover:bg-medium-gray/10"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center border border-medium-gray/30 font-mono text-xs text-code-green">
                      {cmd.icon}
                    </span>
                    <span
                      className={`text-sm ${
                        cmd.flatIndex === selectedIndex
                          ? "text-code-green"
                          : "text-light-gray"
                      }`}
                    >
                      {cmd.label}
                    </span>
                    {cmd.flatIndex === selectedIndex && (
                      <span className="ml-auto text-[10px] text-medium-gray">
                        Enter to select
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center gap-4 border-t border-medium-gray/20 px-4 py-2">
          <div className="flex items-center gap-1">
            <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-1.5 py-0.5 text-[10px] font-mono text-medium-gray">
              &uarr;
            </kbd>
            <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-1.5 py-0.5 text-[10px] font-mono text-medium-gray">
              &darr;
            </kbd>
            <span className="text-[10px] text-medium-gray">navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-1.5 py-0.5 text-[10px] font-mono text-medium-gray">
              &crarr;
            </kbd>
            <span className="text-[10px] text-medium-gray">select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-1.5 py-0.5 text-[10px] font-mono text-medium-gray">
              esc
            </kbd>
            <span className="text-[10px] text-medium-gray">close</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
