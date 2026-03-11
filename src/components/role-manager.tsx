"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

type Member = {
  id: string;
  userId: string;
  name: string;
  role: string;
};

type RoleManagerProps = {
  endeavorId: string;
  members: Member[];
};

const ROLES = ["member", "moderator", "admin"] as const;

export function RoleManager({ endeavorId, members }: RoleManagerProps) {
  const [roles, setRoles] = useState<Record<string, string>>(
    Object.fromEntries(members.map((m) => [m.id, m.role]))
  );
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  if (members.length === 0) return null;

  async function handleRoleChange(memberId: string, newRole: string) {
    const previous = roles[memberId];
    setRoles((prev) => ({ ...prev, [memberId]: newRole }));
    setUpdating(memberId);
    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      toast("Role updated successfully");
    } catch {
      setRoles((prev) => ({ ...prev, [memberId]: previous }));
      toast("Failed to update role", "error");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="border border-medium-gray/20 p-4">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// roles"}
      </h3>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3"
          >
            <span className="truncate font-mono text-xs text-medium-gray">
              {member.name}
            </span>
            <select
              value={roles[member.id]}
              onChange={(e) => handleRoleChange(member.id, e.target.value)}
              disabled={updating === member.id}
              className="border border-medium-gray/20 bg-transparent px-2 py-1 font-mono text-xs text-code-green outline-none transition-colors hover:border-code-green/50 focus:border-code-green disabled:opacity-50"
            >
              {ROLES.map((role) => (
                <option key={role} value={role} className="bg-black">
                  {role}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
