import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags | Endeavor",
  description:
    "Browse endeavors by tags and categories to find projects that match your interests.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
