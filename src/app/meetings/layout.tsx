import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meetings | Endeavor",
  description: "Schedule and manage team meetings",
};

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
