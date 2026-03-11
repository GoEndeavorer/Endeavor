import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time Tracking | Endeavor",
  description: "Track time spent on projects and tasks",
};

export default function TimeTrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
