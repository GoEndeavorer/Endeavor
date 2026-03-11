import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Log | Endeavor",
  description: "View your account activity and security events",
};

export default function AuditLogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
