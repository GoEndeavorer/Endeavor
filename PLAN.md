# Endeavor — Project Plan

> **Version**: 0.9.0
> **Last Updated**: 2026-03-11
> **Status**: Built — Production ready

## Changelog

| Version | Date       | Changes                                                  |
| ------- | ---------- | -------------------------------------------------------- |
| 0.9.0   | 2026-03-11 | Bookmarks, follows, finances, following feed, similar endeavors, platform stats, dashboard widgets |
| 0.8.0   | 2026-03-11 | Notifications page, onboarding flow, member management, discussion editing, SEO, skeletons |
| 0.7.0   | 2026-03-11 | Cover images, activity timeline, categories, admin panel, leave endeavor, feed sorting, email notifications, markdown stories |
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

## Phase 6: Scale & Polish — DONE

- [x] Rate limiting middleware (per-IP, per-minute)
- [x] Report/flag system (users can report endeavors)
- [x] Accessibility: focus-visible styles, skip-to-content, ARIA labels, reduced motion
- [x] Error/loading states: global loading.tsx, error.tsx boundary, 404 page
- [x] Checkout success/cancel pages for Stripe redirects
- [x] Public user profiles (/users/[id])
- [x] Public stories page (/endeavors/[id]/stories)
- [x] Endeavor editing (creator settings tab in dashboard)
- [x] Task assignment notifications + email
- [x] Endeavor status display in feed cards
- [x] Analytics integration (typed event tracking)
- [ ] Performance optimization (image CDN, lazy loading)
- [ ] Error monitoring (Sentry)
- [ ] Automated testing (unit + E2E)

## Phase 7: Full Feature Build-Out — DONE

- [x] Cover images for endeavors (URL-based, on create/edit/detail/feed)
- [x] Activity timeline API + Overview tab on dashboard
- [x] Dashboard progress stats (tasks, milestones, crew count)
- [x] My Endeavors page with created/joined tabs
- [x] Leave endeavor (with notification)
- [x] Feed sorting (newest, popular, oldest)
- [x] Categories browse page with descriptions and counts
- [x] Platform stats API (users, endeavors, memberships)
- [x] Admin moderation panel for report management
- [x] Email notifications: join, task assignment, welcome, invite
- [x] Needs-based search (search by skills/resources needed)
- [x] Markdown rendering for stories (bold, italic, code, links, headings)
- [x] AppHeader component (reusable, auth-aware, mobile responsive)
- [x] Task creation with description and due dates
- [x] Milestone creation with descriptions
- [x] Overdue task indicators
- [x] Mobile-friendly dashboard tabs (horizontal scroll)
- [x] Profile completion prompt on feed
- [x] Bug fix: notifyEndeavorMembers argument order
- [x] Creator profile links on detail page
- [x] Member profile links on detail page
- [x] In-progress endeavors accept new members

## Phase 8: UX Polish & Management — DONE

- [x] Full notifications page with read/unread filtering and time-ago display
- [x] Enhanced public user profiles with stats (tasks, stories, discussions, endeavors)
- [x] Endeavor duplicate/template API for reusing configurations
- [x] Report endeavor API for user-submitted content moderation
- [x] Discussion message editing (author can edit own messages)
- [x] Discussion message deletion by endeavor creator (moderation)
- [x] Markdown rendering in discussion messages
- [x] Creator can remove members from endeavors
- [x] Member removal API with creator authorization
- [x] Settings tab: title, cost, capacity, funding toggle all editable
- [x] Crew members link to public profiles in dashboard
- [x] Onboarding welcome page with profile setup flow
- [x] Loading skeleton components for feed cards
- [x] Dynamic OG/Twitter meta tags with cover images for social sharing
- [x] Enhanced sitemap with in-progress, completed, and story pages
- [x] AppHeader adopted across all pages (feed, create, detail, dashboard, profile, users)
- [x] Completed endeavors page with cover images and creator names
- [x] Categories link in footer, notifications in mobile menu
- [x] Create endeavor redirects to dashboard for immediate setup
- [x] Robots.txt blocks notifications page

## Phase 9: Social & Engagement — DONE

- [x] Bookmark/save endeavors (toggle, API, saved page)
- [x] User follow/unfollow system with follower/following counts
- [x] Follow button on user profiles
- [x] Following feed page (activity from people you follow)
- [x] Feed API aggregating endeavors, updates, and stories from followed users
- [x] Finances tab in dashboard (revenue summary, transaction list, funding progress)
- [x] Payments API for creator finance visibility
- [x] Similar endeavors section on detail page (same category recommendations)
- [x] Live platform stats component on homepage
- [x] Follower/following list API endpoint
- [x] Saved/Following links in desktop and mobile navigation
- [x] Bookmark toggle on endeavor detail page
- [x] Dashboard overview: upcoming milestones widget
- [x] Dashboard overview: pinned updates section
- [x] Categories page refactored to use AppHeader
- [x] SEO metadata layouts for saved and following pages
- [x] Robots.txt updated for new private pages
- [x] Global search with Cmd+K command palette (from Phase 8.5)
- [x] Task filter toggle (my tasks vs all tasks)
- [x] Quick actions bar in dashboard overview

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
│   │   ├── admin/reports         # Admin moderation
│   │   ├── endeavors/           # CRUD, detail, join, leave, checkout, discussions, tasks, links, members, members/[id], milestones, stories, invite, activity, duplicate, report, updates
│   │   ├── endeavors/recommended, trending, stats  # Discovery + analytics
│   │   ├── milestones/[id]      # Milestone CRUD
│   │   ├── notifications/       # In-app notifications
│   │   ├── profile/             # User profile CRUD
│   │   ├── reports/             # User reports
│   │   ├── stories/[storyId]    # Story CRUD
│   │   ├── tasks/[taskId]       # Task CRUD
│   │   ├── links/[linkId]       # Link CRUD
│   │   ├── discussions/[id]     # Discussion CRUD
│   │   ├── bookmarks/           # Bookmark toggle + list
│   │   ├── follow/              # Follow toggle + list
│   │   ├── feed/                # Following feed API
│   │   ├── search/              # Global search API
│   │   └── webhooks/stripe      # Payment webhooks
│   ├── admin/                   # Admin dashboard
│   ├── categories/              # Category browser
│   ├── endeavors/[id]/          # Detail + dashboard + stories + checkout
│   ├── endeavors/create/        # Create form
│   ├── endeavors/completed/     # Completed endeavors showcase
│   ├── feed/                    # Discovery feed with search, filters, sort
│   ├── following/               # Activity from followed users
│   ├── my-endeavors/            # User's endeavors (created + joined)
│   ├── notifications/           # Full notifications page
│   ├── saved/                   # Bookmarked endeavors
│   ├── welcome/                 # Post-signup onboarding flow
│   ├── users/[userId]/          # Public user profiles with stats + follows
│   └── profile/                 # User profile editing
├── components/                  # Shared UI (AppHeader, NotificationBell, ShareButton, MarkdownText, Skeleton, PlatformStats, etc.)
├── lib/
│   ├── auth.ts, auth-client.ts  # Auth config
│   ├── db/schema.ts, index.ts   # Database schema + connection
│   ├── email.ts                 # Resend email integration
│   ├── membership.ts            # Auth helpers
│   ├── notifications.ts         # Notification helpers
│   ├── analytics.ts             # Typed analytics events
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
   - `ADMIN_EMAILS` — comma-separated admin email addresses
4. Run `npm run db:push` to create database tables
5. Set up Stripe webhook pointing to `https://your-domain/api/webhooks/stripe`
   - Event: `checkout.session.completed`

## Database Schema

- **user** — id, name, email, bio, location, skills[], interests[]
- **session** — Better Auth sessions
- **account** — Better Auth OAuth accounts
- **verification** — Better Auth email verification
- **endeavor** — id, title, description, category, location, locationType, needs[], status, costPerPerson, capacity, fundingEnabled, fundingGoal, fundingRaised, imageUrl, joinType, creatorId
- **member** — id, endeavorId, userId, role (creator/collaborator), status (pending/approved/rejected)
- **discussion** — id, endeavorId, authorId, content, createdAt
- **task** — id, endeavorId, title, description, status (todo/in-progress/done), assigneeId, dueDate
- **link** — id, endeavorId, addedById, title, url, description
- **payment** — id, endeavorId, userId, type (join/donation), amount, stripeSessionId, status
- **notification** — id, userId, type, message, endeavorId, read
- **milestone** — id, endeavorId, title, description, targetDate, completed, completedAt
- **story** — id, endeavorId, authorId, title, content, published
- **update** — id, endeavorId, authorId, title, content, pinned
- **report** — id, reporterId, endeavorId, reason, details, status
- **bookmark** — id, userId, endeavorId, createdAt
- **follow** — id, followerId, followingId, createdAt
