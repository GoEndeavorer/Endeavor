import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading List — Endeavor",
  description: "Stories you've saved to read later.",
};

export default function ReadingListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
