import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals | Endeavor",
  description: "Set and track your personal goals",
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
