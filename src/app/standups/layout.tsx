import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standups | Endeavor",
  description: "Daily standup notes and check-ins",
};

export default function StandupsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
