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
  // ── Community Events ──────────────────────────────────────────────────
  {
    id: "meetup",
    name: "Meetup",
    description:
      "Organize a recurring community meetup around a shared interest. Handle venue booking, speaker line-ups, and networking logistics so attendees can focus on connecting.",
    category: "Community Events",
    suggestedNeeds: [
      "Organizer",
      "Venue Host",
      "Speaker Coordinator",
      "Social Media Manager",
      "Welcome Crew",
    ],
    suggestedMilestones: [
      "Theme and target audience defined",
      "Venue and recurring date locked",
      "First event promoted and RSVPs open",
      "Inaugural meetup held",
      "Feedback collected and format refined",
      "10th meetup milestone reached",
    ],
    icon: "heart",
    locationType: "in-person",
    suggestedCapacity: 40,
  },
  {
    id: "hackathon",
    name: "Hackathon",
    description:
      "Organize a timed coding event where teams build innovative solutions to a challenge. Handle logistics, mentorship, judging, and prizes to create an unforgettable experience.",
    category: "Community Events",
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
    id: "workshop-series",
    name: "Workshop",
    description:
      "Design and deliver a series of hands-on workshops teaching a valuable skill. Each session builds on the last, taking participants from beginner to practitioner.",
    category: "Community Events",
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
    id: "fundraiser",
    name: "Fundraiser",
    description:
      "Rally your community behind a cause and raise funds through events, campaigns, or sponsorships. Coordinate donors, volunteers, and communications to hit your target.",
    category: "Community Events",
    suggestedNeeds: [
      "Campaign Manager",
      "Treasurer",
      "Graphic Designer",
      "Social Media Manager",
      "Volunteers",
      "Venue / Platform",
    ],
    suggestedMilestones: [
      "Cause and fundraising goal defined",
      "Campaign materials created",
      "Launch event or campaign page live",
      "50% of goal reached",
      "Thank-you communications sent",
      "Final total announced and funds distributed",
    ],
    icon: "heart",
    locationType: "either",
    suggestedCapacity: 30,
  },

  // ── Creative Projects ─────────────────────────────────────────────────
  {
    id: "documentary-film",
    name: "Film",
    description:
      "Produce a short film or documentary that tells a compelling story. Assemble a small crew to handle research, filming, editing, and distribution.",
    category: "Creative Projects",
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
    id: "album",
    name: "Album",
    description:
      "Collaborate on recording and releasing an original music album. Bring together songwriters, musicians, engineers, and visual artists to create a cohesive body of work.",
    category: "Creative Projects",
    suggestedNeeds: [
      "Producer",
      "Musicians",
      "Mixing Engineer",
      "Mastering Engineer",
      "Album Art Designer",
      "Distribution Manager",
    ],
    suggestedMilestones: [
      "Track list and concept finalized",
      "Pre-production demos recorded",
      "Studio sessions completed",
      "Mixing and mastering finished",
      "Album artwork and packaging approved",
      "Release day and listening party",
    ],
    icon: "music",
    locationType: "either",
    suggestedCapacity: 10,
  },
  {
    id: "art-exhibition",
    name: "Art Exhibition",
    description:
      "Curate and launch a group art exhibition showcasing diverse works. Manage artist submissions, gallery logistics, promotion, and opening night to bring art to the community.",
    category: "Creative Projects",
    suggestedNeeds: [
      "Curator",
      "Gallery Space",
      "Artists",
      "Graphic Designer",
      "Event Coordinator",
      "PR / Marketing",
    ],
    suggestedMilestones: [
      "Exhibition theme and call for submissions published",
      "Artists selected and works confirmed",
      "Gallery space secured and layout planned",
      "Promotional campaign launched",
      "Installation and lighting completed",
      "Opening night event held",
    ],
    icon: "presentation",
    locationType: "in-person",
    suggestedCapacity: 20,
  },
  {
    id: "book-club",
    name: "Book Club",
    description:
      "Start a book club with regular reading cadence and lively discussions. Pick a genre or theme, set a schedule, and create a space for thoughtful conversation.",
    category: "Creative Projects",
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

  // ── Tech Projects ─────────────────────────────────────────────────────
  {
    id: "open-source-project",
    name: "Open Source",
    description:
      "Launch an open source software project that solves a real problem. Rally contributors across code, documentation, and design to build something the community can rely on.",
    category: "Tech Projects",
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
    id: "startup-mvp",
    name: "Startup MVP",
    description:
      "Take an idea from napkin sketch to validated prototype. Assemble a founding team, talk to users, build an MVP, and test whether the market wants what you're making.",
    category: "Tech Projects",
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
    id: "research-project",
    name: "Research Project",
    description:
      "Design and run a collaborative research project. Pool expertise across disciplines to investigate a hypothesis, collect data, and publish findings.",
    category: "Tech Projects",
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

  // ── Adventure ─────────────────────────────────────────────────────────
  {
    id: "expedition",
    name: "Expedition",
    description:
      "Plan a multi-day expedition into remote or challenging terrain. Coordinate logistics, safety protocols, navigation, and supplies for a team pushing into the unknown.",
    category: "Adventure",
    suggestedNeeds: [
      "Expedition Leader",
      "Navigator",
      "Medic / First Aid",
      "Logistics Coordinator",
      "Photographer / Documenter",
      "Equipment Manager",
    ],
    suggestedMilestones: [
      "Destination and route researched",
      "Team assembled and roles assigned",
      "Permits and insurance secured",
      "Gear and supplies procured",
      "Pre-departure briefing completed",
      "Expedition completed and debrief held",
    ],
    icon: "mountain",
    locationType: "in-person",
    suggestedCapacity: 12,
  },
  {
    id: "group-travel",
    name: "Group Travel",
    description:
      "Coordinate a group trip to a new destination. Handle itinerary planning, bookings, budgeting, and local experiences so everyone can enjoy the journey together.",
    category: "Adventure",
    suggestedNeeds: [
      "Trip Planner",
      "Budget Manager",
      "Booking Coordinator",
      "Local Guide",
      "Photographer",
    ],
    suggestedMilestones: [
      "Destination voted on and confirmed",
      "Budget and cost-share agreed",
      "Flights and accommodation booked",
      "Day-by-day itinerary finalized",
      "Trip completed",
      "Photo album and trip recap shared",
    ],
    icon: "rocket",
    locationType: "in-person",
    suggestedCapacity: 15,
  },
  {
    id: "outdoor-challenge",
    name: "Outdoor Challenge",
    description:
      "Take on a physical outdoor challenge as a group — a peak, a trail, a race, or a survival weekend. Train together, push limits, and celebrate the finish line.",
    category: "Adventure",
    suggestedNeeds: [
      "Coach / Trainer",
      "First Aid Certified",
      "Route Planner",
      "Gear Coordinator",
      "Motivator / Morale Lead",
    ],
    suggestedMilestones: [
      "Challenge selected and date set",
      "Training plan created",
      "Gear checklist finalized",
      "Practice run completed",
      "Challenge day executed",
      "Post-challenge celebration held",
    ],
    icon: "leaf",
    locationType: "in-person",
    suggestedCapacity: 10,
  },

  // ── Education ─────────────────────────────────────────────────────────
  {
    id: "study-group",
    name: "Study Group",
    description:
      "Form a focused study group around a specific subject, course, or certification. Share resources, hold regular sessions, and keep each other accountable.",
    category: "Education",
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
    id: "course",
    name: "Course",
    description:
      "Build and deliver a structured course on a topic you know deeply. Create lessons, assignments, and assessments that take learners from zero to competent.",
    category: "Education",
    suggestedNeeds: [
      "Course Creator",
      "Teaching Assistants",
      "Content Reviewer",
      "Platform Admin",
      "Graphic Designer",
    ],
    suggestedMilestones: [
      "Learning objectives and syllabus defined",
      "Lesson content and materials created",
      "Platform or delivery method set up",
      "Enrollment opened",
      "Course delivered with live Q&A sessions",
      "Completion certificates issued and feedback collected",
    ],
    icon: "presentation",
    locationType: "either",
    suggestedCapacity: 30,
  },
  {
    id: "mentorship-program",
    name: "Mentorship Program",
    description:
      "Launch a mentorship program that pairs experienced practitioners with eager learners. Define structure, matching criteria, and milestones to ensure meaningful growth.",
    category: "Education",
    suggestedNeeds: [
      "Program Coordinator",
      "Mentors",
      "Mentees",
      "Matching Algorithm / Process",
      "Feedback Facilitator",
    ],
    suggestedMilestones: [
      "Program goals and structure defined",
      "Mentor applications reviewed and accepted",
      "Mentee applications reviewed and accepted",
      "Mentor-mentee pairs matched",
      "Midpoint check-ins completed",
      "Program graduation and showcase",
    ],
    icon: "bookmark",
    locationType: "either",
    suggestedCapacity: 20,
  },
];

export async function GET() {
  return NextResponse.json(templates);
}
