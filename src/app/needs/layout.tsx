import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse by Need – Endeavor",
  description: "Find endeavors that need specific skills, roles, and resources.",
};

export default function NeedsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
