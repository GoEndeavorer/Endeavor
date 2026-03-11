import Link from "next/link";

type Endeavor = {
  title: string;
  category: string;
  location: string;
  locationType: "in-person" | "remote" | "either";
  description: string;
  needs: string[];
  costPerPerson?: number;
  fundingGoal?: number;
  fundingRaised?: number;
  memberCount: number;
  capacity?: number;
};

const sampleEndeavors: Endeavor[] = [
  {
    title: "Patagonia Research & Music",
    category: "Scientific",
    location: "Patagonia, Chile",
    locationType: "in-person",
    description:
      "Explore Patagonia's glaciers with scientists while musicians compose and perform under the stars.",
    needs: ["Glaciologist", "Musician", "Videographer"],
    costPerPerson: 1200,
    memberCount: 4,
    capacity: 12,
  },
  {
    title: "Open Source Trail Map",
    category: "Tech",
    location: "Worldwide",
    locationType: "remote",
    description:
      "Build a free, open-source trail mapping app for hikers. Needs devs, designers, and trail enthusiasts.",
    needs: ["React Developer", "UX Designer", "Trail Data"],
    fundingGoal: 5000,
    fundingRaised: 1250,
    memberCount: 7,
  },
  {
    title: "Sahara Art & Astronomy Camp",
    category: "Creative",
    location: "Sahara Desert, Morocco",
    locationType: "in-person",
    description:
      "A week painting desert landscapes by day and stargazing with astronomers by night.",
    needs: ["Astronomer", "Funding"],
    costPerPerson: 850,
    fundingGoal: 3000,
    fundingRaised: 900,
    memberCount: 6,
    capacity: 15,
  },
  {
    title: "Community Garden Documentary",
    category: "Creative",
    location: "Austin, TX",
    locationType: "in-person",
    description:
      "Document the people behind Austin's community gardens. Short film, real stories.",
    needs: ["Editor", "Sound Engineer"],
    costPerPerson: 0,
    memberCount: 3,
    capacity: 6,
  },
  {
    title: "Coral Reef Conservation Dive",
    category: "Adventure",
    location: "Great Barrier Reef, AU",
    locationType: "in-person",
    description:
      "Join marine biologists to survey reef health, plant coral, and document the journey underwater.",
    needs: ["Marine Biologist", "Underwater Photographer", "Funding"],
    costPerPerson: 2100,
    fundingGoal: 8000,
    fundingRaised: 3200,
    memberCount: 5,
    capacity: 10,
  },
  {
    title: "Kyoto Cultural Immersion",
    category: "Cultural",
    location: "Kyoto, Japan",
    locationType: "in-person",
    description:
      "Spend two weeks learning traditional crafts from Kyoto artisans — ceramics, calligraphy, tea ceremony.",
    needs: ["Translator", "Photographer"],
    costPerPerson: 1800,
    memberCount: 3,
    capacity: 8,
  },
];

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Scientific: "border-code-blue text-code-blue",
    Tech: "border-purple-400 text-purple-400",
    Creative: "border-yellow-400 text-yellow-400",
    Adventure: "border-code-green text-code-green",
    Cultural: "border-orange-400 text-orange-400",
  };
  return (
    <span className={`border px-2 py-0.5 text-xs uppercase ${colors[category] || "border-medium-gray text-medium-gray"}`}>
      {category}
    </span>
  );
}

function LocationTypeBadge({ type }: { type: string }) {
  return (
    <span className="text-xs text-medium-gray">
      {type === "in-person" ? "In-Person" : type === "remote" ? "Remote" : "In-Person / Remote"}
    </span>
  );
}

function FundingBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-medium-gray">
        <span>${raised.toLocaleString()} raised</span>
        <span>{pct}% of ${goal.toLocaleString()}</span>
      </div>
      <div className="h-1 w-full bg-medium-gray/30">
        <div className="h-1 bg-code-green" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EndeavorCard({ endeavor }: { endeavor: Endeavor }) {
  return (
    <div className="group flex flex-col border border-medium-gray/30 p-5 transition-colors hover:border-code-green/50">
      <div className="mb-3 flex items-center gap-2">
        <CategoryBadge category={endeavor.category} />
        <LocationTypeBadge type={endeavor.locationType} />
      </div>

      <h3 className="mb-1 text-lg font-bold">{endeavor.title}</h3>
      <p className="mb-1 text-xs text-medium-gray">{endeavor.location}</p>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-light-gray">
        {endeavor.description}
      </p>

      {/* Needs */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {endeavor.needs.map((need) => (
          <span key={need} className="bg-white/5 px-2 py-0.5 text-xs text-light-gray">
            need: {need}
          </span>
        ))}
      </div>

      {/* Cost / Funding */}
      <div className="mt-auto">
        {endeavor.costPerPerson !== undefined && endeavor.costPerPerson > 0 && (
          <p className="text-sm font-semibold text-code-green">
            ${endeavor.costPerPerson.toLocaleString()}/person
          </p>
        )}
        {endeavor.costPerPerson === 0 && (
          <p className="text-sm font-semibold text-code-green">Free to join</p>
        )}
        {endeavor.fundingGoal && endeavor.fundingRaised !== undefined && (
          <FundingBar raised={endeavor.fundingRaised} goal={endeavor.fundingGoal} />
        )}
      </div>

      {/* Members */}
      <div className="mt-3 flex items-center justify-between border-t border-medium-gray/20 pt-3">
        <span className="text-xs text-medium-gray">
          {endeavor.memberCount} joined
          {endeavor.capacity ? ` / ${endeavor.capacity} spots` : ""}
        </span>
        <span className="text-xs font-semibold text-code-blue group-hover:text-code-green transition-colors">
          View &rarr;
        </span>
      </div>
    </div>
  );
}

export function ExplorePreview() {
  return (
    <section id="explore" className="border-t border-medium-gray/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
          {"// explore endeavors"}
        </h2>
        <p className="mb-12 text-2xl font-bold md:text-3xl">
          Find something that needs you.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleEndeavors.map((e) => (
            <EndeavorCard key={e.title} endeavor={e} />
          ))}
        </div>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link
            href="/feed"
            className="border border-medium-gray px-8 py-3 text-sm font-bold uppercase transition-colors hover:border-code-green hover:text-code-green"
          >
            Browse All Endeavors
          </Link>
          <Link
            href="/endeavors/completed"
            className="border border-code-green/30 px-8 py-3 text-sm font-bold uppercase text-code-green transition-colors hover:border-code-green hover:bg-code-green hover:text-black"
          >
            Success Stories
          </Link>
        </div>
      </div>
    </section>
  );
}
