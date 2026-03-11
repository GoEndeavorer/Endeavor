import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback Board | Endeavor",
  description: "Submit and vote on feature requests and feedback",
};

export default function FeedbackBoardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
