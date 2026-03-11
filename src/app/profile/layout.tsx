import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Endeavor",
  description: "Manage your Endeavor profile, skills, interests, and view your endeavors.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
