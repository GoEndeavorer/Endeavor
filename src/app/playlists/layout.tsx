import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Playlists | Endeavor",
  description:
    "Curated learning playlists from the Endeavor community. Discover resources, tutorials, and guides organized by topic.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
