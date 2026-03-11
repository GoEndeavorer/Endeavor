import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Endeavors | Endeavor",
  description: "Your bookmarked endeavors.",
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
