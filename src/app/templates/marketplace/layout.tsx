import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Template Marketplace | Endeavor",
  description:
    "Browse community-rated project templates. Find the perfect starting point for your next endeavor, sorted by popularity, ratings, and category.",
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
