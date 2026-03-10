# Endeavor — Project Plan

> **Version**: 0.3.0
> **Last Updated**: 2026-03-10
> **Status**: In Development (Phases 1–5 built)

## Changelog

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 0.3.0   | 2026-03-10 | Phases 1–5 built: full platform with payments & discovery |
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
- [x] Dashboard link from endeavor detail page
- [ ] Shared timeline / milestone tracker
- [ ] File/link sharing
- [ ] Role assignments within an endeavor
- [ ] Notifications (in-app + email)

## Phase 4: Funding — DONE

- [x] Stripe integration (lazy init for build compat)
- [x] Cost-to-join: Stripe Checkout redirect when joining a paid endeavor
- [x] Crowdfunding: donate button with adjustable amount
- [x] Pricing display on feed and detail pages
- [x] Stripe webhook for payment completion (auto-join + funding updates)
- [x] Payment table tracking all transactions
- [ ] Payment confirmation + receipt emails
- [ ] Refund handling for cancellations
- [ ] Backer/donor visibility
- [ ] Fee structure (platform cut)

## Phase 5: Discovery & Growth — PARTIAL

- [x] "Recommended for you" feed (skill/interest matching)
- [x] Trending endeavors (by member count)
- [x] Search with text + category + location type filters
- [x] Profile editing (bio, location, skills, interests)
- [ ] Location-based browsing (map view)
- [ ] Social sharing
- [ ] Invite system
- [ ] Post-endeavor stories / galleries

## Phase 6: Scale & Polish — TODO

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
2. **Show what's needed** — Every endeavor clearly communicates what help it needs.
3. **Mobile-first** — Most users will discover endeavors on their phones.
4. **Fast** — Every page loads in under 2 seconds.
5. **Simple** — Four verbs: post, join, plan, fund.

## Tech Stack

| Layer       | Technology              | Status |
| ----------- | ----------------------- | ------ |
| Frontend    | Next.js (App Router)    | Done   |
| Styling     | Tailwind CSS            | Done   |
| Backend/API | Next.js API routes      | Done   |
| Database    | PostgreSQL + Drizzle ORM| Done   |
| Auth        | Better Auth             | Done   |
| Payments    | Stripe                  | Done   |
| Hosting     | Vercel                  | Ready  |
| Storage     | Cloudflare R2 or AWS S3 | TODO   |
| Email       | Resend                  | TODO   |

## To Deploy

1. Create a Neon PostgreSQL database at neon.tech
2. Connect GitHub repo to Vercel
3. Set environment variables on Vercel:
   - `DATABASE_URL` — Neon connection string
   - `BETTER_AUTH_SECRET` — random secret key
   - `BETTER_AUTH_URL` — your Vercel domain (e.g., https://endeavor.vercel.app)
   - `STRIPE_SECRET_KEY` — from Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET` — from Stripe webhook settings
4. Run `npm run db:push` to create database tables
5. Set up Stripe webhook pointing to `https://your-domain/api/webhooks/stripe`

## Remaining Decisions

1. **Fee structure** — What percentage does the platform take on payments?
2. **Target audience** — Launch with a niche or go broad?
3. **Moderation** — How to handle spam/abuse as the platform grows?
