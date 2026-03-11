import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitations — Endeavor",
  description: "Manage your sent and received invitations on Endeavor.",
};

export default function InvitesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
