import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources | Endeavor",
  description: "Community-curated resources, tutorials, and tools",
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
