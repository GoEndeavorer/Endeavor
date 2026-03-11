"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Array<BreadcrumbItem>;
}

function truncate(text: string, max = 20): string {
  return text.length > max ? text.slice(0, max) + "\u2026" : text;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...items.filter((item) => item.label !== "Home"),
  ];

  return (
    <nav aria-label="Breadcrumb" className="text-xs font-mono flex items-center gap-1.5">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-medium-gray" aria-hidden="true">
                /
              </span>
            )}
            {isLast ? (
              <span className="text-medium-gray" aria-current="page">
                {truncate(item.label)}
              </span>
            ) : (
              <Link
                href={item.href ?? "/"}
                className="text-code-blue hover:text-code-green transition-colors"
              >
                {truncate(item.label)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
