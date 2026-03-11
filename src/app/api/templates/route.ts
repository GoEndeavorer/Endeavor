import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const templates = [
  {
    id: "open-source",
    title: "Open Source Project",
    description: "Start an open source software project with contributors",
    category: "Tech",
    needs: ["Frontend Developer", "Backend Developer", "Designer", "Documentation"],
    locationType: "remote",
    suggestedCapacity: 20,
  },
  {
    id: "community-garden",
    title: "Community Garden",
    description: "Organize a community garden in your neighborhood",
    category: "Community",
    needs: ["Gardeners", "Land Access", "Tools", "Seeds"],
    locationType: "in-person",
    suggestedCapacity: 15,
  },
  {
    id: "film-production",
    title: "Independent Film",
    description: "Produce a short film or documentary with a small crew",
    category: "Creative",
    needs: ["Director", "Cinematographer", "Editor", "Sound Designer", "Actors"],
    locationType: "in-person",
    suggestedCapacity: 12,
  },
  {
    id: "research-study",
    title: "Research Study",
    description: "Conduct collaborative scientific research",
    category: "Scientific",
    needs: ["Researchers", "Data Analysts", "Lab Access", "Funding"],
    locationType: "either",
    suggestedCapacity: 10,
  },
  {
    id: "hiking-expedition",
    title: "Hiking Expedition",
    description: "Plan and execute a multi-day hiking adventure",
    category: "Adventure",
    needs: ["Guide", "First Aid", "Navigation", "Camp Cooking"],
    locationType: "in-person",
    suggestedCapacity: 8,
  },
  {
    id: "cultural-exchange",
    title: "Cultural Exchange",
    description: "Connect people from different cultures through shared activities",
    category: "Cultural",
    needs: ["Translators", "Event Coordinators", "Local Guides"],
    locationType: "either",
    suggestedCapacity: 25,
  },
  {
    id: "hackathon",
    title: "Hackathon",
    description: "Run a timed coding challenge to build innovative solutions",
    category: "Tech",
    needs: ["Developers", "Designers", "Mentors", "Judges", "Sponsors"],
    locationType: "either",
    suggestedCapacity: 50,
  },
  {
    id: "book-club",
    title: "Book Club",
    description: "Form a reading group with regular discussions",
    category: "Community",
    needs: ["Readers", "Discussion Moderator"],
    locationType: "either",
    suggestedCapacity: 15,
  },
];

export async function GET() {
  return NextResponse.json(templates);
}
