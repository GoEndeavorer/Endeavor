import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "People | Endeavor",
  description:
    "Discover collaborators, creators, and skilled people on Endeavor. Find the right people for your next project.",
};

export default function PeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
