import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Digest | Endeavor",
  description: "A weekly summary of what happened across the Endeavor platform.",
};

export default function DigestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
