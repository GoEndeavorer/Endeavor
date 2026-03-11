import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | Endeavor",
  description:
    "Discover trending topics, in-demand skills, popular categories, and active locations on Endeavor.",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
