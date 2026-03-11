import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  suggestedNeeds: string[];
  suggestedMilestones: string[];
  icon: string;
  locationType: string;
  suggestedCapacity: number;
};

export const templates: Template[] = [
  {
    id: "open-source-project",
    name: "Open Source Project",
    description:
      "Launch an open source software project that solves a real problem. Rally contributors across code, documentation, and design to build something the community can rely on.",
    category: "Tech",
    suggestedNeeds: [
      "Frontend Developer",
      "Backend Developer",
      "Designer",
      "Technical Writer",
      "DevOps",
    ],
    suggestedMilestones: [
      "Define project scope and architecture",
      "Set up repository and CI/CD pipeline",
      "Ship v0.1 MVP",
      "Write contributor guidelines and docs",
      "First external contribution merged",
      "Release v1.0 stable",
    ],
    icon: "terminal",
    locationType: "remote",
    suggestedCapacity: 20,
  },
  {
    id: "hiking-trip",
    name: "Hiking Trip",
    description:
      "Plan and execute a multi-day hiking adventure through scenic trails. Coordinate gear, logistics, navigation, and safety so the group can focus on the journey.",
    category: "Adventure",
    suggestedNeeds: [
      "Guide",
      "Photographer",
      "First Aid Certified",
      "Navigation",
      "Camp Cook",
    ],
    suggestedMilestones: [
      "Choose route and dates",
      "Gear checklist finalized",
      "Transportation booked",
      "Permits acquired",
      "Pre-hike meetup completed",
      "Summit reached / trail completed",
    ],
    icon: "mountain",
    locationType: "in-person",
    suggestedCapacity: 10,
  },
  {
    id: "study-group",
    name: "Study Group",
    description:
      "Form a focused study group around a specific subject, course, or certification. Share resources, hold regular sessions, and keep each other accountable.",
    category: "Community",
    suggestedNeeds: [
      "Study Coordinator",
      "Note-Taker",
      "Resource Curator",
      "Quiz Master",
    ],
    suggestedMilestones: [
      "Select topic and study materials",
      "Set weekly meeting schedule",
      "Complete first study module",
      "Midpoint review and knowledge check",
      "Final review session",
      "All members pass assessment",
    ],
    icon: "book-open",
    locationType: "either",
    suggestedCapacity: 12,
  },
  {
    id: "startup-idea",
    name: "Startup Idea",
    description:
      "Take an idea from napkin sketch to validated prototype. Assemble a founding team, talk to users, build an MVP, and test whether the market wants what you're making.",
    category: "Tech",
    suggestedNeeds: [
      "Product Manager",
      "Full-Stack Developer",
      "Designer",
      "Marketing",
      "Business Strategist",
    ],
    suggestedMilestones: [
      "Problem statement and hypothesis defined",
      "50 user interviews completed",
      "MVP wireframes approved",
      "Working prototype built",
      "Beta launch with 100 users",
      "First revenue or funding secured",
    ],
    icon: "rocket",
    locationType: "either",
    suggestedCapacity: 6,
  },
  {
    id: "community-garden",
    name: "Community Garden",
    description:
      "Transform an empty lot into a thriving community garden. Bring neighbors together to grow food, share knowledge, and build something green and lasting.",
    category: "Community",
    suggestedNeeds: [
      "Experienced Gardener",
      "Land Access",
      "Tools & Supplies",
      "Irrigation Setup",
      "Compost Manager",
    ],
    suggestedMilestones: [
      "Secure land or plot agreement",
      "Soil testing and bed preparation",
      "Seeds and seedlings planted",
      "Irrigation system installed",
      "First harvest",
      "Community harvest festival",
    ],
    icon: "leaf",
    locationType: "in-person",
    suggestedCapacity: 20,
  },
  {
    id: "hackathon",
    name: "Hackathon",
    description:
      "Organize a timed coding event where teams build innovative solutions to a challenge. Handle logistics, mentorship, judging, and prizes to create an unforgettable experience.",
    category: "Tech",
    suggestedNeeds: [
      "Organizer",
      "Mentors",
      "Judges",
      "Sponsors",
      "Venue / Platform",
      "Designers",
    ],
    suggestedMilestones: [
      "Theme and challenge defined",
      "Sponsors and prizes secured",
      "Registrations open",
      "Mentor roster confirmed",
      "Hackathon weekend executed",
      "Winners announced and demos published",
    ],
    icon: "code",
    locationType: "either",
    suggestedCapacity: 50,
  },
  {
    id: "documentary-film",
    name: "Documentary Film",
    description:
      "Produce a short documentary that tells a compelling, untold story. Assemble a small crew to handle research, filming, editing, and distribution.",
    category: "Creative",
    suggestedNeeds: [
      "Director",
      "Cinematographer",
      "Sound Engineer",
      "Editor",
      "Narrator",
      "Researcher",
    ],
    suggestedMilestones: [
      "Story concept and outline finalized",
      "Research and pre-interviews completed",
      "Filming schedule locked",
      "Principal photography wrapped",
      "Rough cut reviewed",
      "Final cut exported and submitted to festivals",
    ],
    icon: "film",
    locationType: "in-person",
    suggestedCapacity: 8,
  },
  {
    id: "science-experiment",
    name: "Science Experiment",
    description:
      "Design and run a collaborative research experiment. Pool expertise across disciplines to investigate a hypothesis, collect data, and publish findings.",
    category: "Scientific",
    suggestedNeeds: [
      "Lead Researcher",
      "Data Analyst",
      "Lab Technician",
      "Subject Matter Expert",
      "Technical Writer",
    ],
    suggestedMilestones: [
      "Hypothesis and methodology defined",
      "Ethics review / approval obtained",
      "Equipment and materials sourced",
      "Data collection completed",
      "Analysis and results documented",
      "Paper drafted and submitted for review",
    ],
    icon: "flask",
    locationType: "either",
    suggestedCapacity: 10,
  },
  {
    id: "music-festival",
    name: "Music Festival",
    description:
      "Plan and host a local music festival celebrating live performance. Coordinate artists, sound, staging, vendors, and volunteers for a day (or weekend) of music.",
    category: "Cultural",
    suggestedNeeds: [
      "Event Planner",
      "Sound Engineer",
      "Stage Manager",
      "Musicians",
      "Vendors",
      "Volunteers",
    ],
    suggestedMilestones: [
      "Venue and date confirmed",
      "Artist lineup finalized",
      "Permits and insurance secured",
      "Tickets on sale",
      "Sound check and stage setup complete",
      "Festival day executed successfully",
    ],
    icon: "music",
    locationType: "in-person",
    suggestedCapacity: 30,
  },
  {
    id: "book-club",
    name: "Book Club",
    description:
      "Start a book club with regular reading cadence and lively discussions. Pick a genre or theme, set a schedule, and create a space for thoughtful conversation.",
    category: "Community",
    suggestedNeeds: [
      "Discussion Moderator",
      "Book Selector",
      "Note-Taker",
      "Readers",
    ],
    suggestedMilestones: [
      "Genre / theme chosen and first book selected",
      "Meeting cadence and platform set",
      "First discussion held",
      "5 books completed",
      "Guest author Q&A organized",
      "Annual reading list published",
    ],
    icon: "bookmark",
    locationType: "either",
    suggestedCapacity: 15,
  },
  {
    id: "workshop-series",
    name: "Workshop Series",
    description:
      "Design and deliver a series of hands-on workshops teaching a valuable skill. Each session builds on the last, taking participants from beginner to practitioner.",
    category: "Community",
    suggestedNeeds: [
      "Lead Instructor",
      "Teaching Assistants",
      "Venue",
      "Materials & Supplies",
      "Marketing",
    ],
    suggestedMilestones: [
      "Curriculum outline completed",
      "Venue and materials secured",
      "Registrations open and promoted",
      "Workshop 1 delivered",
      "Midpoint feedback collected and applied",
      "Final workshop and certificates issued",
    ],
    icon: "presentation",
    locationType: "in-person",
    suggestedCapacity: 25,
  },
  {
    id: "volunteer-drive",
    name: "Volunteer Drive",
    description:
      "Mobilize volunteers for a cause that matters. Organize sign-ups, training, logistics, and recognition to make a measurable impact in your community.",
    category: "Community",
    suggestedNeeds: [
      "Volunteer Coordinator",
      "Trainers",
      "Transportation",
      "Supplies",
      "Social Media Manager",
    ],
    suggestedMilestones: [
      "Cause and goals defined",
      "Partner organizations confirmed",
      "Volunteer recruitment drive launched",
      "Training sessions completed",
      "Volunteer day executed",
      "Impact report published",
    ],
    icon: "heart",
    locationType: "in-person",
    suggestedCapacity: 50,
  },
];

export async function GET() {
  return NextResponse.json(templates);
}
