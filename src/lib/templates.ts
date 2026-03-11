export type EndeavorTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  suggestedNeeds: string[];
  suggestedMilestones: string[];
  suggestedTasks: string[];
};

export const templates: EndeavorTemplate[] = [
  {
    id: "hackathon",
    name: "Hackathon",
    description:
      "Organize a time-boxed coding event where teams build projects from scratch. Great for fostering innovation and collaboration among developers.",
    category: "Technology",
    suggestedNeeds: [
      "Developers",
      "Designers",
      "Venue/Space",
      "Mentors",
      "Judges",
      "Sponsors",
      "Prizes",
    ],
    suggestedMilestones: [
      "Theme announced",
      "Registration opens",
      "Kickoff event",
      "Mid-point check-in",
      "Final submissions",
      "Judging & awards",
    ],
    suggestedTasks: [
      "Set up registration form",
      "Secure venue or virtual platform",
      "Recruit judges and mentors",
      "Create judging criteria",
      "Plan opening ceremony",
      "Arrange food and drinks",
      "Set up communication channels",
    ],
  },
  {
    id: "book-club",
    name: "Book Club",
    description:
      "Start a reading group that meets regularly to discuss books. Perfect for building community through shared literary exploration.",
    category: "Education",
    suggestedNeeds: [
      "Members",
      "Meeting space",
      "Book suggestions",
      "Discussion facilitator",
    ],
    suggestedMilestones: [
      "First book selected",
      "Inaugural meeting",
      "5 books completed",
      "10 members reached",
      "One-year anniversary",
    ],
    suggestedTasks: [
      "Create a reading list",
      "Set meeting schedule",
      "Choose first book",
      "Prepare discussion questions",
      "Find a meeting venue or set up virtual calls",
      "Create a voting system for book selection",
    ],
  },
  {
    id: "sports-league",
    name: "Sports League",
    description:
      "Organize a recreational sports league for your community. Bring people together through friendly competition and team-based athletics.",
    category: "Sports",
    suggestedNeeds: [
      "Players",
      "Referees",
      "Equipment",
      "Fields/Courts",
      "Scorekeeper",
      "First aid supplies",
    ],
    suggestedMilestones: [
      "Teams formed",
      "Season schedule published",
      "Opening day",
      "Mid-season tournament",
      "Championship game",
      "Awards ceremony",
    ],
    suggestedTasks: [
      "Draft league rules",
      "Reserve playing fields",
      "Set up team registration",
      "Create season schedule",
      "Recruit referees",
      "Order jerseys and equipment",
      "Set up standings tracker",
    ],
  },
  {
    id: "community-garden",
    name: "Community Garden",
    description:
      "Build and maintain a shared garden space where neighbors can grow food, flowers, and community bonds together.",
    category: "Community",
    suggestedNeeds: [
      "Land/Space",
      "Gardeners",
      "Seeds and supplies",
      "Tools",
      "Water access",
      "Fencing",
    ],
    suggestedMilestones: [
      "Land secured",
      "Garden beds built",
      "First planting day",
      "First harvest",
      "Community event hosted",
      "Full season completed",
    ],
    suggestedTasks: [
      "Find and secure a plot of land",
      "Design garden layout",
      "Build raised beds",
      "Install irrigation system",
      "Assign garden plots to members",
      "Create planting schedule",
      "Organize volunteer workdays",
    ],
  },
  {
    id: "road-trip",
    name: "Road Trip",
    description:
      "Plan an epic group road trip adventure. Coordinate routes, stops, accommodations, and shared experiences along the way.",
    category: "Travel",
    suggestedNeeds: [
      "Drivers",
      "Vehicles",
      "Navigation",
      "Budget contributions",
      "Camping gear",
      "Photographer",
    ],
    suggestedMilestones: [
      "Route planned",
      "Accommodations booked",
      "Departure day",
      "Halfway point reached",
      "Destination arrived",
      "Return home",
    ],
    suggestedTasks: [
      "Plan the route and stops",
      "Book accommodations",
      "Create a shared budget",
      "Assign driving shifts",
      "Build a road trip playlist",
      "Pack emergency supplies",
      "Plan activities at each stop",
    ],
  },
  {
    id: "study-group",
    name: "Study Group",
    description:
      "Form a focused study group to learn a subject together. Share resources, quiz each other, and stay accountable as a team.",
    category: "Education",
    suggestedNeeds: [
      "Students",
      "Study materials",
      "Meeting space",
      "Tutor/Expert",
      "Whiteboard/Display",
    ],
    suggestedMilestones: [
      "Study plan created",
      "First session completed",
      "Midterm review done",
      "Practice exams completed",
      "Final exam prep finished",
      "Results celebrated",
    ],
    suggestedTasks: [
      "Define study topics and goals",
      "Create a study schedule",
      "Gather textbooks and resources",
      "Assign topic leads for each session",
      "Create practice quizzes",
      "Set up shared notes document",
    ],
  },
  {
    id: "open-source-project",
    name: "Open Source Project",
    description:
      "Launch an open source software project. Collaborate with contributors worldwide to build something useful for the community.",
    category: "Technology",
    suggestedNeeds: [
      "Developers",
      "Technical writers",
      "Designers",
      "Code reviewers",
      "Testers",
      "DevOps",
    ],
    suggestedMilestones: [
      "Repository created",
      "First contributor onboarded",
      "MVP released",
      "10 stars reached",
      "v1.0 launched",
      "100 downloads",
    ],
    suggestedTasks: [
      "Set up repository and CI/CD",
      "Write contributing guidelines",
      "Create issue templates",
      "Design project architecture",
      "Write initial documentation",
      "Set up automated testing",
      "Create a project roadmap",
    ],
  },
  {
    id: "volunteer-event",
    name: "Volunteer Event",
    description:
      "Organize a volunteer event to give back to your community. Coordinate volunteers, supplies, and logistics for maximum impact.",
    category: "Community",
    suggestedNeeds: [
      "Volunteers",
      "Transportation",
      "Supplies",
      "Coordinator",
      "First aid",
      "Refreshments",
    ],
    suggestedMilestones: [
      "Partner organization confirmed",
      "Volunteer sign-ups open",
      "Supplies gathered",
      "Event day",
      "Follow-up completed",
      "Impact report shared",
    ],
    suggestedTasks: [
      "Identify cause and partner organization",
      "Set date and location",
      "Create volunteer sign-up form",
      "Gather needed supplies",
      "Arrange transportation",
      "Plan safety briefing",
      "Prepare thank-you materials",
    ],
  },
];
