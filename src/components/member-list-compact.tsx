"use client";

import Link from "next/link";

type CompactMember = {
  userId: string;
  name: string;
  image: string | null;
  role: string;
};

export function MemberListCompact({
  members,
  maxShow = 5,
}: {
  members: CompactMember[];
  maxShow?: number;
}) {
  if (members.length === 0) return null;

  const shown = members.slice(0, maxShow);
  const remaining = members.length - maxShow;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// members"} <span className="text-medium-gray font-normal">({members.length})</span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {shown.map((m) => (
          <Link
            key={m.userId}
            href={`/users/${m.userId}`}
            className="flex items-center gap-2 border border-medium-gray/10 px-2 py-1 hover:border-medium-gray/30 transition-colors"
            title={`${m.name} (${m.role})`}
          >
            {m.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={m.image} alt="" className="h-5 w-5 object-cover" />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center bg-code-green/10 text-[10px] font-bold text-code-green">
                {m.name.charAt(0)}
              </div>
            )}
            <span className="text-xs text-light-gray">{m.name}</span>
            {m.role !== "member" && (
              <span className="text-[10px] text-code-blue capitalize">{m.role}</span>
            )}
          </Link>
        ))}
        {remaining > 0 && (
          <span className="flex items-center px-2 py-1 text-xs text-medium-gray">
            +{remaining} more
          </span>
        )}
      </div>
    </div>
  );
}
