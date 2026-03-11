import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentorship | Endeavor",
  description: "Find mentors and connect with experienced community members",
};

export default function MentorshipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
