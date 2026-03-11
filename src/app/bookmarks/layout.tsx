import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks | Endeavor",
  description: "Your saved bookmarks and folders",
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
