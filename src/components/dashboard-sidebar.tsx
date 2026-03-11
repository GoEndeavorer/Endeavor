"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardSidebarProps = {
  endeavorId: string;
  title: string;
  isCreator: boolean;
  currentPath?: string;
};

const navItems = [
  { label: "Dashboard", suffix: "/dashboard", icon: ">" },
  { label: "Members", suffix: "/members", icon: "#" },
  { label: "Timeline", suffix: "/timeline", icon: "~" },
  { label: "Chat", suffix: "/chat", icon: "$" },
  { label: "Stories", suffix: "/stories", icon: "%" },
  { label: "Analytics", suffix: "/analytics", icon: "&", creatorOnly: true },
  { label: "Settings", suffix: "/settings", icon: "*", creatorOnly: true },
];

export function DashboardSidebar({
  endeavorId,
  title,
  isCreator,
  currentPath,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname;
  const base = `/endeavors/${endeavorId}`;

  return (
    <nav className="w-full space-y-1 font-mono text-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// navigation"}
      </h3>

      <p className="mb-4 truncate text-xs text-medium-gray">{title}</p>

      {navItems.map((item) => {
        if (item.creatorOnly && !isCreator) return null;

        const href = `${base}${item.suffix}`;
        const isActive = activePath === href;

        return (
          <Link
            key={item.suffix}
            href={href}
            className={`block px-2 py-1 transition-colors ${
              isActive
                ? "text-code-green"
                : "text-medium-gray hover:text-code-green"
            }`}
          >
            <span className="mr-2 inline-block w-3 text-center">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}

      <div className="my-3 border-t border-medium-gray/20" />

      <Link
        href={base}
        className="block px-2 py-1 text-medium-gray transition-colors hover:text-code-green"
      >
        <span className="mr-2 inline-block w-3 text-center">@</span>
        View Public Page
      </Link>
    </nav>
  );
}
