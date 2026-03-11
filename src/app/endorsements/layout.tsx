import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Endorsement Wall | Endeavor",
  description:
    "Browse endorsements from across the Endeavor community. See what collaborators are saying about the endeavors they have joined.",
};

export default function EndorsementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
