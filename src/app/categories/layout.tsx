import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Categories | Endeavor",
  description: "Explore endeavors by category — adventure, scientific, creative, tech, cultural, and community projects.",
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
