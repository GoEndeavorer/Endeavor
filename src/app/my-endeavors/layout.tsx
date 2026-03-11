import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Endeavors | Endeavor",
  description: "View and manage your endeavors — projects you've created and joined.",
};

export default function MyEndeavorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
