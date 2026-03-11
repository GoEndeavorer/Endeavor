import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Endeavors | Endeavor",
  description: "Browse and discover endeavors. Find projects to join, people to collaborate with, and ideas to fund.",
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
