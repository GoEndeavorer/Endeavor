import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Results | Endeavor",
  description:
    "Search for endeavors, people, categories, skills, and locations across the Endeavor community.",
  openGraph: {
    title: "Search | Endeavor",
    description: "Find endeavors, collaborators, and categories on Endeavor.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
