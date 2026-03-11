import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Directory | Endeavor",
  description: "Browse and find community members",
};

export default function TeamDirectoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
