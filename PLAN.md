# Endeavor — Project Plan

> **Version**: 0.6.0
> **Last Updated**: 2026-03-11
> **Status**: Built — Ready for deployment

## Changelog

| Version | Date       | Changes                                                  |
| ------- | ---------- | -------------------------------------------------------- |
| 0.6.0   | 2026-03-11 | Public profiles, settings tab, checkout pages, accessibility, task notifications |
| 0.5.0   | 2026-03-11 | Milestones, stories, invite system, email integration, dashboard UI |
| 0.4.0   | 2026-03-10 | All phases built: notifications, links, moderation, rate limiting |
| 0.3.0   | 2026-03-10 | Phases 1–5 built: full platform with payments & discovery |
| 0.2.0   | 2026-03-10 | Pivot to collaborative project platform + crowdfunding   |
| 0.1.0   | 2026-03-10 | Initial plan — phases, stack, design principles          |

---

## Vision

**Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.**

Endeavor is a platform where anyone can post a project (an "endeavor"), others can join it, and together they plan and execute it — with optional crowdfunding built in. It sits in the gap between Meetup (finding people), Kickstarter (funding ideas), and lightweight project tools (planning together).

## Core Concepts

- **Endeavor** — A project someone wants to make happen. Could be anything: a hiking expedition, a documentary, a community garden, a hackathon, an art installation.
- **Creator** — The person who posts an endeavor.
- **Collaborators** — People who join an endeavor to help make it happen.
- **Cost to Join** — For planned endeavors, the creator sets a per-person cost to participate (e.g., "$450/person for the Patagonia trek"). Covers travel, lodging, gear, or whatever the endeavor requires. Shown prominently on the detail page so people know what they're signing up for.
- **Funding** — Optional, separate from cost to join. Creators can toggle on crowdfunding (Kickstarter-style) to raise money for the endeavor itself — equipment, permits, venue, production costs, etc.
- **Needs** — Each endeavor can list what it needs: skills ("need: videographer"), resources ("need: camera gear"), or funding. This turns passive browsing into active matching.

---

## Phase 1: Foundation & Landing Page — DONE

- [x] Initialize project with Next.js + Tailwind CSS + TypeScript
- [x] Rebuild landing page (hero, how-it-works, explore preview, about, CTA)
- [x] Add responsive mobile navigation (hamburger menu)
- [x] Set up for Vercel deployment
- [x] Add SEO meta tags and Open Graph

## Phase 2: Core Platform (MVP) — DONE

- [x] Next.js App Router backend
- [x] PostgreSQL + Drizzle ORM schema (users, endeavors, members)
- [x] Better Auth (email/password signup & login)
- [x] Create Endeavor flow (title, description, category, location, needs, cost, capacity, join type, funding toggle)
- [x] Discovery feed with search, category, and location type filters
- [x] Endeavor detail page (description, needs, cost, funding bar, members, join button)
- [x] Join an endeavor (open join or request-to-join, capacity checks)
- [x] User profile page

## Phase 3: Collaboration Tools — DONE

- [x] Endeavor dashboard (members only)
- [x] Discussion threads per endeavor
- [x] Shared task list with kanban columns (todo / in-progress / done)
- [x] Task assignment to crew members
- [x] Shared links/resources
- [x] Member management (creator approves/rejects join requests)
- [x] In-app notifications (join, discussion, approval)
- [x] Notification bell in header
- [x] Shared timeline / milestone tracker (with target dates, completion tracking)

## Phase 4: Funding — DONE

- [x] Stripe integration (lazy init for build compat)
- [x] Cost-to-join: Stripe Checkout redirect when joining a paid endeavor
- [x] Crowdfunding: donate button with adjustable amount
- [x] Pricing display on feed and detail pages
- [x] Stripe webhook for payment completion (auto-join + funding updates)
- [x] Payment table tracking all transactions
- [x] Payment confirmation + receipt emails (Resend integration)
- [ ] Refund handling (future)

## Phase 5: Discovery & Growth — DONE

- [x] "Recommended for you" feed (skill/interest matching)
- [x] Trending endeavors (by member count)
- [x] Search with text + category + location type filters
- [x] Profile editing (bio, location, skills, interests)
- [x] Share button (Web Share API + clipboard fallback)
- [ ] Location-based map view (future)
- [x] Invite system (email invitations via Resend)
- [x] Post-endeavor stories with draft/publish workflow

## Phase 6: Scale & Polish — MOSTLY DONE

- [x] Rate limiting middleware (per-IP, per-minute)
- [x] Report/flag system (users can report endeavors)
- [x] Accessibility: focus-visible styles, skip-to-content, ARIA labels, reduced motion
- [x] Error/loading states: global loading.tsx, error.tsx boundary, 404 page
- [x] Checkout success/cancel pages for Stripe redirects
- [x] Public user profiles (/users/[id])
- [x] Public stories page (/endeavors/[id]/stories)
- [x] Endeavor editing (creator settings tab in dashboard)
- [x] Task assignment notifications
- [x] Endeavor status display in feed cards
- [ ] Performance optimization (image CDN, lazy loading)
- [ ] Analytics integration
- [ ] Error monitoring (Sentry)
- [ ] Automated testing (unit + E2E)

---

## Design Principles

1. **Code-inspired aesthetic** — Monospace type (Fira Code), high contrast black/green palette, terminal accents.
2. **Show what's needed** — Every endeavor clearly communicates what help it needs.
3. **Mobile-first** — Responsive design with hamburger nav.
4. **Fast** — Every page loads in under 2 seconds.
5. **Simple** — Four verbs: post, join, plan, fund.

## Tech Stack

| Layer       | Technology              | Status |
| ----------- | ----------------------- | ------ |
| Frontend    | Next.js 16 (App Router) | Done   |
| Styling     | Tailwind CSS 4          | Done   |
| Backend/API | Next.js API routes      | Done   |
| Database    | PostgreSQL + Drizzle ORM| Done   |
| Auth        | Better Auth             | Done   |
| Payments    | Stripe                  | Done   |
| Hosting     | Vercel                  | Ready  |
| Storage     | Cloudflare R2 or AWS S3 | Future |
| Email       | Resend                  | Done   |

## Architecture

```
src/
├── app/
│   ├── (auth)/login, signup     # Auth pages
│   ├── api/
│   │   ├── auth/[...all]        # Better Auth handler
│   │   ├── endeavors/           # CRUD, detail, join, checkout, discussions, tasks, links, members, milestones, stories, invite
│   │   ├── endeavors/recommended, trending  # Discovery
│   │   ├── milestones/[id]      # Milestone CRUD
│   │   ├── notifications/       # In-app notifications
│   │   ├── profile/             # User profile CRUD
│   │   ├── reports/             # Moderation
│   │   ├── tasks/[taskId]       # Task CRUD
│   │   └── webhooks/stripe      # Payment webhooks
│   ├── endeavors/[id]/          # Detail + dashboard
│   ├── endeavors/create/        # Create form
│   ├── feed/                    # Discovery feed
│   └── profile/                 # User profile
├── components/                  # Shared UI components
├── lib/
│   ├── auth.ts, auth-client.ts  # Auth config
│   ├── db/schema.ts, index.ts   # Database schema + connection
│   ├── email.ts                 # Resend email integration
│   ├── membership.ts            # Auth helpers
│   ├── notifications.ts         # Notification helpers
│   └── stripe.ts                # Payment config
└── middleware.ts                # Rate limiting
```

## To Deploy

1. Create a Neon PostgreSQL database at neon.tech
2. Connect GitHub repo to Vercel
3. Set environment variables on Vercel:
   - `DATABASE_URL` — Neon connection string
   - `BETTER_AUTH_SECRET` — random secret key
   - `BETTER_AUTH_URL` — your Vercel domain (e.g., https://endeavor.vercel.app)
   - `STRIPE_SECRET_KEY` — from Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET` — from Stripe webhook settings
   - `RESEND_API_KEY` — from Resend dashboard
   - `EMAIL_FROM` — verified sender email
4. Run `npm run db:push` to create database tables
5. Set up Stripe webhook pointing to `https://your-domain/api/webhooks/stripe`
   - Event: `checkout.session.completed`

## Database Schema

- **user** — id, name, email, bio, location, skills[], interests[]
- **session** — Better Auth sessions
- **account** — Better Auth OAuth accounts
- **verification** — Better Auth email verification
- **endeavor** — id, title, description, category, location, locationType, needs[], status, costPerPerson, capacity, fundingEnabled, fundingGoal, fundingRaised, joinType, creatorId
- **member** — id, endeavorId, userId, role (creator/collaborator), status (pending/approved/rejected)
- **discussion** — id, endeavorId, authorId, content, createdAt
- **task** — id, endeavorId, title, description, status (todo/in-progress/done), assigneeId, dueDate
- **link** — id, endeavorId, addedById, title, url, description
- **payment** — id, endeavorId, userId, type (join/donation), amount, stripeSessionId, status
- **notification** — id, userId, type, message, endeavorId, read
- **milestone** — id, endeavorId, title, description, targetDate, completed, completedAt
- **story** — id, endeavorId, authorId, title, content, published
- **report** — id, reporterId, endeavorId, reason, details, status
