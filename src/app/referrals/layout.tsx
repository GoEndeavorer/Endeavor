import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referrals | Endeavor",
  description: "Invite friends and earn rewards",
};

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
