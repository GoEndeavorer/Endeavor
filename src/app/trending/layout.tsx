import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Topics | Endeavor",
  description:
    "Explore trending categories, in-demand skills, and popular locations across the Endeavor community.",
};

export default function TrendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
