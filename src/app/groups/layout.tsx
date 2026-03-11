import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groups | Endeavor",
  description: "Join communities of like-minded creators and collaborators",
};

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
