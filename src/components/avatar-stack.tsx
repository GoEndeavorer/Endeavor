"use client";

type AvatarStackProps = {
  users: { id: string; name: string; image: string | null }[];
  max?: number;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

const overlapClasses = {
  sm: "-ml-2",
  md: "-ml-2.5",
  lg: "-ml-3",
};

export function AvatarStack({ users, max = 5, size = "md" }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div
          key={user.id}
          className={`${sizeClasses[size]} ${i > 0 ? overlapClasses[size] : ""} rounded-full border-2 border-black flex items-center justify-center shrink-0`}
          title={user.name}
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className={`${sizeClasses[size]} rounded-full bg-code-green/20 text-code-green font-bold flex items-center justify-center`}>
              {user.name?.charAt(0) || "?"}
            </span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <span className={`${sizeClasses[size]} ${overlapClasses[size]} rounded-full border-2 border-black bg-medium-gray/30 text-medium-gray font-bold flex items-center justify-center`}>
          +{remaining}
        </span>
      )}
    </div>
  );
}
