import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Library | Endeavor",
  description: "Manage your uploaded images, videos, and files",
};

export default function MediaLibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
