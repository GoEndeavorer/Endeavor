import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | Endeavor",
  description:
    "Search for endeavors, people, skills, and locations on Endeavor.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
