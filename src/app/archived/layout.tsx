import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archived Endeavors – Endeavor",
  description: "Your archived and cancelled endeavors.",
};

export default function ArchivedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
