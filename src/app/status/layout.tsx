import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status — Endeavor",
  description: "Check the current status of Endeavor services and view any ongoing incidents or maintenance.",
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
