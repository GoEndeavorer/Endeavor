import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Q&A | Endeavor",
  description: "Ask questions and share knowledge with the community",
};

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
