"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export function QuickActions() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/endeavors/create"
        className="border border-code-green px-3 py-1.5 text-xs font-semibold text-code-green transition-colors hover:bg-code-green hover:text-black"
      >
        + Create Endeavor
      </Link>
      <Link
        href="/hiring"
        className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
      >
        Find Opportunities
      </Link>
      <Link
        href="/people"
        className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
      >
        Find People
      </Link>
      <Link
        href="/explore"
        className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
      >
        Trending
      </Link>
    </div>
  );
}
