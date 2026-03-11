import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Endeavor",
  description: "Your personal overview and activity",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
