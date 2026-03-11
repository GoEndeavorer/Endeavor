import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map | Endeavor",
  description: "Explore endeavors by location. Find projects happening near you.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
