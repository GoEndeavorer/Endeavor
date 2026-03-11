import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback | Endeavor",
  description: "Share your feedback and vote on feature requests",
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
