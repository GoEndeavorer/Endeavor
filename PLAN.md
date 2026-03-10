# Endeavor — Project Plan

> **Version**: 0.1.0
> **Last Updated**: 2026-03-10
> **Status**: Planning

## Changelog

| Version | Date       | Changes                          |
| ------- | ---------- | -------------------------------- |
| 0.1.0   | 2026-03-10 | Initial plan — phases, stack, design principles |

---

## Vision

Endeavor is a curated travel platform that connects visionaries — travelers, scientists, artists, explorers — to co-create extraordinary group adventures. Trips combine exploration with creative expression and community impact.

## Current State

- Single `index.html` landing page (HTML5, Tailwind CSS, vanilla JS)
- Code-inspired design aesthetic (Fira Code, black/white/green palette)
- Trip filtering by location search and category (Scientific, Artistic, Adventure, Cultural)
- 4 placeholder trips, no real data or backend
- No build system, no dependencies beyond CDN resources
- Hosted at github.com/GoEndeavorer/Endeavor

---

## Phase 1: Foundation

**Goal**: Proper project structure, real content, polished landing page.

- [ ] Initialize project with a build tool (Vite recommended)
- [ ] Break `index.html` into components (header, hero, trips, impact, footer)
- [ ] Replace placeholder images with real photography/video
- [ ] Add trip detail pages with itinerary, pricing, dates, and team bios
- [ ] Add responsive mobile navigation (hamburger menu)
- [ ] Set up Vercel deployment (connect GitHub repo, configure builds)
- [ ] Add SEO meta tags, Open Graph, and favicon

## Phase 2: Backend & Data

**Goal**: Dynamic trips, user accounts, and content management.

- [ ] Choose backend stack (options: Next.js, Astro + API routes, or standalone API)
- [ ] Set up database (PostgreSQL or similar) with schema for:
  - Trips (destination, dates, category, capacity, price, itinerary, team)
  - Users (profile, interests, past trips)
  - Bookings (user, trip, status, payment)
- [ ] Build trip CRUD API
- [ ] Add authentication (email/password + OAuth)
- [ ] Create signup/login pages
- [ ] Build user profile/dashboard page
- [ ] Admin panel for managing trips and content

## Phase 3: Booking & Payments

**Goal**: Users can browse, book, and pay for trips.

- [ ] Integrate payment processor (Stripe recommended)
- [ ] Build booking flow: select trip → choose dates → payment → confirmation
- [ ] Email confirmations and receipts
- [ ] Waitlist functionality for full trips
- [ ] Cancellation and refund policy handling

## Phase 4: Community & Engagement

**Goal**: Build the collaborative, community-driven experience.

- [ ] Trip co-creation tools (propose ideas, vote, collaborate on itineraries)
- [ ] Traveler profiles with skills/interests matching
- [ ] Trip journals / post-trip galleries and stories
- [ ] Impact tracking dashboard (e.g., clean water projects funded)
- [ ] Newsletter and notification system
- [ ] Social sharing integration

## Phase 5: Scale & Polish

**Goal**: Production-grade platform ready for growth.

- [ ] Performance optimization (image CDN, lazy loading, caching)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Analytics integration (privacy-respecting)
- [ ] Error monitoring (Sentry or similar)
- [ ] Automated testing (unit + E2E)
- [ ] Documentation for contributors

---

## Design Principles

1. **Code-inspired aesthetic** — Monospace type, high contrast, terminal accents. The design should feel like it was built by explorers who code.
2. **Content over chrome** — Let photography and trip details do the talking. Minimal UI decoration.
3. **Mobile-first** — Most users will discover trips on their phones.
4. **Fast** — Every page should load in under 2 seconds.

## Tech Stack (Recommended)

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Frontend    | Astro or Next.js              |
| Styling     | Tailwind CSS                  |
| Backend/API | Node.js (API routes)          |
| Database    | PostgreSQL + Drizzle ORM      |
| Auth        | Better Auth or Lucia          |
| Payments    | Stripe                        |
| Hosting     | Vercel                        |
| Storage     | Cloudflare R2 or AWS S3       |
| Email       | Resend                        |

## Key Decisions to Make

1. **Static vs. dynamic** — Stay with static HTML for now, or move to a framework immediately?
2. **Trip data source** — The XLSX loader in the current code suggests spreadsheet-based trip data. Keep that workflow or move to a database from the start?
3. **Target audience** — The code-inspired design appeals to tech/science crowds. Is that the intended market, or should the aesthetic broaden?
4. **MVP scope** — What's the minimum needed to start accepting real trip signups?
