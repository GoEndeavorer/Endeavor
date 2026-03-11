"use client";

type Profile = {
  name: string;
  bio: string | null;
  location: string | null;
  skills: string[] | null;
  interests: string[] | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
};

const FIELDS: { key: keyof Profile; label: string; weight: number }[] = [
  { key: "name", label: "Display name", weight: 15 },
  { key: "bio", label: "Bio", weight: 20 },
  { key: "location", label: "Location", weight: 10 },
  { key: "skills", label: "Skills", weight: 20 },
  { key: "interests", label: "Interests", weight: 15 },
  { key: "website", label: "Website or social link", weight: 10 },
  { key: "github", label: "GitHub", weight: 5 },
  { key: "twitter", label: "Twitter/X", weight: 5 },
];

function isFieldFilled(profile: Profile, key: keyof Profile): boolean {
  const val = profile[key];
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return !!val;
}

export function ProfileCompleteness({ profile }: { profile: Profile }) {
  const totalWeight = FIELDS.reduce((s, f) => s + f.weight, 0);
  const filledWeight = FIELDS.reduce(
    (s, f) => s + (isFieldFilled(profile, f.key) ? f.weight : 0),
    0
  );
  const pct = Math.round((filledWeight / totalWeight) * 100);

  if (pct === 100) return null;

  const missing = FIELDS.filter((f) => !isFieldFilled(profile, f.key));

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// profile completeness"}
        </h3>
        <span className="text-xs text-medium-gray">{pct}%</span>
      </div>
      <div className="h-1.5 bg-medium-gray/10 mb-3">
        <div
          className="h-full bg-code-green transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {missing.length > 0 && (
        <div className="space-y-1">
          {missing.slice(0, 3).map((f) => (
            <p key={f.key} className="text-xs text-medium-gray">
              <span className="text-yellow-400 mr-1">+</span>
              Add {f.label}
            </p>
          ))}
          {missing.length > 3 && (
            <p className="text-xs text-medium-gray">
              ...and {missing.length - 3} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
