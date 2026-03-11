import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Activity | Endeavor",
  description:
    "See what's happening across Endeavor — new projects, completed milestones, published stories, and more.",
};

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
