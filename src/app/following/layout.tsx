import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Following Feed | Endeavor",
  description: "Activity from users and endeavors you follow.",
};

export default function FollowingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
