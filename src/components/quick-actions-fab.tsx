"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function QuickActionsFAB() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  const actions = [
    { label: "New Endeavor", href: "/endeavors/create", color: "bg-code-green text-black" },
    { label: "Messages", href: "/messages", color: "bg-code-blue text-black" },
    { label: "Dashboard", href: "/dashboard", color: "bg-purple-400 text-black" },
    { label: "Digest", href: "/digest", color: "bg-yellow-400 text-black" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      {open && (
        <div className="mb-3 flex flex-col-reverse gap-2">
          {actions.map((a) => (
            <button
              key={a.href}
              onClick={() => {
                setOpen(false);
                router.push(a.href);
              }}
              className={`${a.color} px-4 py-2 text-xs font-bold shadow-lg`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center text-2xl font-bold shadow-lg transition-all ${
          open
            ? "bg-red-500 text-white rotate-45"
            : "bg-code-green text-black"
        }`}
      >
        +
      </button>
    </div>
  );
}
