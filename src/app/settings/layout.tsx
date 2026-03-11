import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Endeavor",
  description: "Manage your account settings.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
