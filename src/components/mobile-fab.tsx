"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function MobileFAB() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  const actions = [
    { label: "New Endeavor", href: "/endeavors/create", icon: "+" },
    { label: "My Endeavors", href: "/my-endeavors", icon: "#" },
    { label: "Messages", href: "/messages", icon: "@" },
    { label: "Feed", href: "/feed", icon: ">" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Action items */}
      {open && (
        <div className="mb-3 flex flex-col items-end gap-2">
          {actions.map((a) => (
            <button
              key={a.href}
              onClick={() => { setOpen(false); router.push(a.href); }}
              className="flex items-center gap-2 bg-black border border-code-green/50 px-4 py-2 text-sm shadow-lg shadow-code-green/10"
            >
              <span className="text-medium-gray">{a.label}</span>
              <span className="font-mono font-bold text-code-green">{a.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center border-2 shadow-lg transition-all ${
          open
            ? "border-red-400 bg-black text-red-400 rotate-45 shadow-red-400/10"
            : "border-code-green bg-code-green text-black shadow-code-green/20"
        }`}
        aria-label="Quick actions"
      >
        <span className="text-2xl font-bold">+</span>
      </button>
    </div>
  );
}
