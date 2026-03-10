# Endeavor — Project Plan

> **Version**: 0.2.0
> **Last Updated**: 2026-03-10
> **Status**: Planning

## Changelog

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 0.2.0   | 2026-03-10 | Pivot to collaborative project platform + crowdfunding |
| 0.1.0   | 2026-03-10 | Initial plan — phases, stack, design principles       |

---

## Vision

**Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.**

Endeavor is a platform where anyone can post a project (an "endeavor"), others can join it, and together they plan and execute it — with optional crowdfunding built in. It sits in the gap between Meetup (finding people), Kickstarter (funding ideas), and lightweight project tools (planning together).

## Core Concepts

- **Endeavor** — A project someone wants to make happen. Could be anything: a hiking expedition, a documentary, a community garden, a hackathon, an art installation.
- **Creator** — The person who posts an endeavor.
- **Collaborators** — People who join an endeavor to help make it happen.
- **Funding** — Optional. Creators can toggle on a donate/fund button (Kickstarter-style) for endeavors that need money.
- **Needs** — Each endeavor can list what it needs: skills ("need: videographer"), resources ("need: camera gear"), or funding. This turns passive browsing into active matching.

## Current State

- Single `index.html` landing page (HTML5, Tailwind CSS, vanilla JS)
- Code-inspired design aesthetic (Fira Code, black/white/green palette)
- Placeholder trip content from earlier concept — needs full rework
- No build system, no dependencies beyond CDN resources
- Hosted at github.com/GoEndeavorer/Endeavor

---

## Phase 1: Foundation & Landing Page

**Goal**: New landing page that communicates the platform, proper project structure, deployment.

- [ ] Initialize project with a build tool (Vite recommended)
- [ ] Rebuild landing page to reflect the new concept (post → join → plan → fund)
- [ ] Add responsive mobile navigation
- [ ] Set up Vercel deployment (connect GitHub repo, configure builds)
- [ ] Add SEO meta tags, Open Graph, and favicon

## Phase 2: Core Platform (MVP)

**Goal**: Users can create endeavors, others can discover and join them. This is the core bet — does the loop work?

- [ ] Set up backend framework (Next.js recommended for Vercel)
- [ ] Set up database (PostgreSQL + Drizzle ORM) with schema for:
  - Endeavors (title, description, category, location, remote/in-person/either, needs, status, creator)
  - Users (profile, skills, interests, location)
  - Memberships (user ↔ endeavor, role: creator/collaborator)
- [ ] Authentication (email/password + OAuth)
- [ ] **Create Endeavor** flow — post with title, description, category, location type, and needs
- [ ] **Discovery feed** — browse endeavors with filters:
  - Location (local / remote / either)
  - Category
  - Skills needed (match what the user brings)
- [ ] **Endeavor detail page** — description, creator, who's joined, what's needed
- [ ] **Join an endeavor** — request to join or open join
- [ ] User profile page (skills, interests, endeavors joined/created)

## Phase 3: Collaboration Tools

**Goal**: Once people join an endeavor, they can actually plan and work together.

- [ ] Endeavor dashboard (visible to members only)
- [ ] Discussion threads or chat per endeavor
- [ ] Shared task list / checklist
- [ ] Shared timeline or milestone tracker
- [ ] File/link sharing
- [ ] Role assignments within an endeavor
- [ ] Notifications (in-app + email) for activity updates

## Phase 4: Funding

**Goal**: Optional crowdfunding for endeavors that need money.

- [ ] Creator toggle: enable/disable funding on an endeavor
- [ ] Funding goal + progress bar
- [ ] Integrate Stripe for donations/contributions
- [ ] Backer/donor visibility (public or anonymous option)
- [ ] Fund disbursement to creator
- [ ] Funding updates (creator posts progress to backers)
- [ ] Consider fee structure (platform cut, payment processing)

## Phase 5: Discovery & Growth

**Goal**: Make discovery the killer feature — help people find endeavors that need them.

- [ ] "Needs you" feed — endeavors matched to user's skills and interests
- [ ] Location-based browsing (map view)
- [ ] Trending / featured endeavors
- [ ] Search with full-text and filters
- [ ] Categories and tags system
- [ ] Social sharing (share an endeavor to get people in)
- [ ] Invite system (invite friends to a specific endeavor)
- [ ] Post-endeavor stories / galleries (show what happened)

## Phase 6: Scale & Polish

**Goal**: Production-grade platform.

- [ ] Performance optimization (image CDN, lazy loading, caching)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Analytics (privacy-respecting)
- [ ] Error monitoring (Sentry or similar)
- [ ] Automated testing (unit + E2E)
- [ ] Moderation tools (report, flag, review)
- [ ] Rate limiting and abuse prevention
- [ ] Documentation

---

## Design Principles

1. **Code-inspired aesthetic** — Monospace type, high contrast, terminal accents.
2. **Show what's needed** — Every endeavor should clearly communicate what help it needs. Discovery is about matching people to needs.
3. **Mobile-first** — Most users will discover endeavors on their phones.
4. **Fast** — Every page loads in under 2 seconds.
5. **Simple** — Four verbs: post, join, plan, fund. Keep it that simple.

## Tech Stack

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Frontend    | Next.js (App Router)          |
| Styling     | Tailwind CSS                  |
| Backend/API | Next.js API routes            |
| Database    | PostgreSQL + Drizzle ORM      |
| Auth        | Better Auth or Lucia          |
| Payments    | Stripe                        |
| Hosting     | Vercel                        |
| Storage     | Cloudflare R2 or AWS S3       |
| Email       | Resend                        |
| Realtime    | Vercel AI SDK or Pusher (for chat/notifications) |

## Key Decisions to Make

1. **Framework** — Next.js is the natural fit for Vercel. Confirm or explore alternatives (Astro, SvelteKit).
2. **MVP scope** — Phase 2 is the core bet. What's the absolute minimum to test whether people will post endeavors and strangers will join?
3. **Joining model** — Open join (anyone can join instantly) vs. request-to-join (creator approves)? Or let the creator choose per endeavor?
4. **Funding model** — What's the platform fee? How are funds held and disbursed? Need to sort out legal/financial structure.
5. **Target audience** — Launch with a niche (e.g., creative projects, outdoor adventures, local community projects) or go broad?
