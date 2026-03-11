import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | Endeavor",
  description: "Upcoming events from your endeavors",
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
