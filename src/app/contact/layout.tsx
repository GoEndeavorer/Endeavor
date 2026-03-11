import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Endeavor",
  description: "Get in touch with the Endeavor team. We're here to help with questions, feedback, and support.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
