import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance | Endeavor",
  description: "Endeavor is currently under maintenance. We will be back shortly.",
};

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
