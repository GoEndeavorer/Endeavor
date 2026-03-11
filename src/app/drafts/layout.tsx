import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drafts – Endeavor",
  description: "Manage your draft endeavors before publishing.",
};

export default function DraftsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
