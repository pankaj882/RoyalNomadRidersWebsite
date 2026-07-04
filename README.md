# Royal Nomad Riders Club

Official website for **Royal Nomad Riders Club** — an adventure motorcycle riding community. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Prisma, and Supabase (Postgres, Auth, Storage). Designed to run entirely on free tiers (Vercel + Supabase) aside from your domain.

> **Build status:** Phase 1 of 7 complete — Foundation & Architecture.
> See [Roadmap](#roadmap) below for what ships in each phase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Animation | Framer Motion (lightweight, viewport-triggered only) |
| Database | Supabase PostgreSQL (Free Tier) |
| ORM | Prisma |
| Auth | Supabase Auth (`@supabase/ssr`) |
| File Storage | Supabase Storage |
| Hosting | Vercel (Free/Hobby Plan) |
| Email | Resend (transactional email) |

---

## 1. Prerequisites

- Node.js **18.18+** (Node 20 LTS recommended)
- npm 10+
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account
- (Optional, Phase 5+) A free [Resend](https://resend.com) account for transactional email

---

## 2. Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Fill in .env — see "Supabase Setup" below for where to find each value

# 4. Generate the Prisma client
npm run prisma:generate

# 5. Push the schema to your Supabase database
npm run prisma:migrate

# 6. Seed initial data (blog categories)
npm run prisma:seed

# 7. Start the dev server
npm run dev
```

Visit `http://localhost:3000`.

---

## 3. Supabase Setup

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **API keys** — go to **Project Settings → API** and copy into `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL` ← Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` ← `service_role` key (**server-only, never commit or expose**)
3. **Database connection strings** — go to **Project Settings → Database → Connection string**:
   - `DATABASE_URL` ← the **Transaction** pooled connection string (port `6543`, add `?pgbouncer=true`)
   - `DIRECT_URL` ← the **Session/Direct** connection string (port `5432`) — required for Prisma migrations
4. **Auth settings** — go to **Authentication → URL Configuration**:
   - Set **Site URL** to your deployed domain (or `http://localhost:3000` for local dev)
   - Add `{SITE_URL}/auth/callback` to **Redirect URLs**
5. **Storage** (used starting Phase 3 — Gallery) — create a public bucket named `gallery` under **Storage**.

### Creating your first Super Admin

1. Register an account through the app at `/register`.
2. Confirm the email (check inbox for the Supabase confirmation link).
3. Promote the account to Super Admin via the Supabase SQL Editor:
   ```sql
   update public.users set role = 'SUPER_ADMIN' where email = 'you@example.com';
   ```
4. Sign in — you'll now have full `/admin` access once the admin CMS screens ship (Phase 6).

### Featuring a rider on the About page's Core Members section

Any user can be marked as a founding/core member for public display — independent of their access `role`:
```sql
update public.users
set is_founder = true, founder_title = 'Ride Captain', display_order = 1
where email = 'you@example.com';
```

---

## 4. Project Structure

```
royal-nomad-riders/
├── prisma/
│   ├── schema.prisma        # Single source of truth for all data models
│   └── seed.ts               # Seeds blog categories
├── public/                   # Static assets (icons, manifest, textures)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register, password reset — shared centered layout
│   │   ├── about/               # About page (history, mission/vision, safety, timeline, core members)
│   │   ├── admin/                 # Role-protected dashboard (requireAdminAccess)
│   │   ├── auth/callback/          # Supabase email-confirmation / OAuth redirect handler
│   │   ├── contact/                  # Contact page + submitContactAction server action
│   │   ├── api/
│   │   │   ├── auth/me/                # Client-fetched current-user endpoint (see Phase 2 notes)
│   │   │   └── newsletter/              # Newsletter subscribe route handler
│   │   ├── layout.tsx                     # Root layout: fonts, JSON-LD, Navbar/Footer, AuthProvider
│   │   ├── page.tsx                        # Home page — composes every homepage section
│   │   ├── sitemap.ts                       # Dynamic sitemap.xml
│   │   ├── robots.ts                         # Dynamic robots.txt
│   │   ├── error.tsx                          # Global error boundary
│   │   ├── not-found.tsx                       # 404 page
│   │   └── loading.tsx                          # Root loading skeleton
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (Button, Card, Dialog, Sheet, ...)
│   │   ├── layout/             # Navbar, Footer
│   │   ├── home/                 # Homepage sections (Hero, LatestRide, UpcomingEvents, ...)
│   │   ├── about/                  # About page sections (History, MissionVision, SafetyGuidelines, ...)
│   │   ├── contact/                 # ContactForm, ContactInfo, MapEmbed
│   │   ├── shared/                    # Logo, SectionHeading, AnimatedContainer, BlogCard, EventCard, EmptyState
│   │   └── providers/                  # AuthProvider (client-side session hydration — see Phase 2 notes)
│   ├── lib/
│   │   ├── supabase/           # Browser client, server client, middleware session helper
│   │   ├── validations/         # Zod schemas (auth, contact; more added per phase)
│   │   ├── data/                  # Prisma query functions, kept separate from components
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── auth.ts                   # getCurrentUser, requireRole, requireAdminAccess, etc.
│   │   ├── constants.ts                # Site config, nav links, role labels
│   │   ├── seo.ts                       # Metadata + JSON-LD builders
│   │   ├── instagram.ts                  # Instagram Graph API client
│   │   ├── rate-limit.ts                  # Upstash-backed rate limiting with in-memory fallback
│   │   ├── get-client-ip.ts                # Requester IP resolution for rate limiting
│   │   ├── utils.ts                         # cn(), slugify, formatDate, etc.
│   │   ├── env.ts                            # Client-safe env validation (Zod)
│   │   └── env.server.ts                      # Server-only secret validation (Zod, `server-only` guarded)
│   ├── hooks/                   # useSupabaseAuthListener, useMediaQuery
│   ├── types/                    # Shared TS types + hand-maintained Supabase Database type
│   └── middleware.ts               # Session refresh + /admin route protection
├── next.config.mjs               # Image optimization, security headers, caching
├── tailwind.config.ts              # Adventure theme tokens (black/white/charcoal/red)
└── .env.example                      # Full list of required environment variables
```

---

## 5. Architecture Notes

- **Prisma is the ORM of record.** Supabase's JS client is used only for **Auth** and **Storage** — all application data (users, blogs, events, gallery, registrations) is read/written through Prisma against the same Postgres database.
- **`users.id` mirrors `auth.users.id`.** When someone signs up via Supabase Auth, a matching row is upserted into the Prisma-managed `users` table (see `src/app/(auth)/actions.ts` and `src/app/auth/callback/route.ts`), carrying application-level fields like `role`.
- **Role-based authorization** has two layers:
  1. `src/middleware.ts` — fast, Edge-safe check: is there a session at all for `/admin/**`?
  2. `src/lib/auth.ts` (`requireRole`, `requireAdminAccess`, `requireManagementAccess`, `requireSuperAdmin`) — precise role checks against Prisma, called at the top of each protected Server Component/Action. Middleware intentionally stays coarse-grained since fine-grained checks require a database round-trip.
- **Server-only secrets never reach the client bundle.** `src/lib/env.server.ts` is guarded by the `server-only` package — importing it from a Client Component fails the build immediately instead of silently leaking a key.
- **SEO is centralized.** Every route builds its `Metadata` via `buildMetadata()` in `src/lib/seo.ts`, so canonical URLs, Open Graph, and Twitter Cards stay consistent site-wide. JSON-LD helpers (`buildOrganizationJsonLd`, `buildBlogPostingJsonLd`, `buildEventJsonLd`, etc.) are added to pages as their data models ship.

---

## 6. Deployment (Vercel — Free Plan)

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add every variable from `.env.example` under **Project Settings → Environment Variables** (use your production Supabase project's values, and set `NEXT_PUBLIC_SITE_URL` to your real domain).
5. Deploy. Vercel runs `prisma generate` automatically via the `postinstall` script.
6. After the first deploy, run migrations against production from your machine:
   ```bash
   DATABASE_URL="<prod-url>" DIRECT_URL="<prod-direct-url>" npm run prisma:deploy
   ```
7. Add your custom domain under **Project Settings → Domains**, then update `NEXT_PUBLIC_SITE_URL` and the Supabase **Site URL** / **Redirect URLs** to match.

---

## 7. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Start production server (after build) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run type-check` | TypeScript check with no output |
| `npm run prisma:migrate` | Create & apply a local migration |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |
| `npm run prisma:seed` | Seed blog categories |

---

## Roadmap

- [x] **Phase 1 — Foundation:** Next.js/TS/Tailwind/shadcn scaffold, full Prisma schema, Supabase Auth, middleware, theme, nav/footer, SEO base, error/loading states, README.
- [x] **Phase 2 — Public Pages:** Home (all sections), About, Contact — see [Phase 2 notes](#phase-2-notes) below.
- [ ] **Phase 3 — Gallery:** Albums, upload, lightbox, search/filter, admin CMS.
- [ ] **Phase 4 — Blog:** Rich text editor, CRUD, categories, comments, likes.
- [ ] **Phase 5 — Events + Registration:** Event list, registration form, CSV export, confirmation email.
- [ ] **Phase 6 — Admin Dashboard:** Full stats, role management, unified CMS.
- [ ] **Phase 7 — SEO/Performance Pass + Deployment Guide.**

---

## Phase 2 Notes

**New pages:** `/` (full homepage), `/about`, `/contact` — all with `buildMetadata()` SEO + `BreadcrumbList`/`Organization`/`WebSite` JSON-LD.

**Homepage sections** (`src/components/home/`), each an independent async Server Component reading live Prisma data with a graceful empty state when no content exists yet: Hero, Latest Ride, Upcoming Events, Recent Blogs, Gallery Preview, Ride Statistics, Testimonials, Instagram Feed, Newsletter CTA. Sections below the hero stream in via `<Suspense>` (see `src/components/home/section-skeleton.tsx`).

**Schema additions** (`prisma/schema.prisma`):
- `Testimonial` model — homepage social-proof section.
- `User.isFounder` / `User.founderTitle` / `User.displayOrder` — lets any user account be surfaced on the About page's Core Members section without touching their access `role`.

**Architecture decision — client-side auth hydration:** The root layout no longer calls `getCurrentUser()` server-side. Reading the Supabase session requires `cookies()`, and calling that from the root layout (which wraps every route) would force **every page in the app** — including the fully static marketing pages — out of static rendering / ISR. Instead:
- `src/app/api/auth/me/route.ts` exposes the current user as a small JSON endpoint.
- `src/components/providers/auth-provider.tsx` is now a **client** component that fetches that endpoint on mount and on Supabase auth-state changes, exposing `useAuth()` (user only) and `useAuthState()` (user + `isLoading`, for avoiding a flash of signed-out UI).
- Net effect: `/`, `/about`, and `/contact` are statically generated / ISR-revalidated (`export const revalidate = ...`), and the navbar's auth-aware UI hydrates a moment after first paint. `/admin/**` remains fully dynamic (it calls `requireAdminAccess()` server-side, which does need `cookies()` — appropriate, since dashboard content is inherently per-user and shouldn't be cached).

**New shared library code:**
- `src/lib/instagram.ts` — Instagram Graph API client (server-only, fails soft to an empty array + empty-state UI when `INSTAGRAM_ACCESS_TOKEN` isn't configured).
- `src/lib/rate-limit.ts` — Upstash Redis rate limiting with an in-memory fallback for single-instance deployments; used by the contact form (5 submissions/hour/IP) and reused for event registration in Phase 5.
- `src/lib/get-client-ip.ts` — resolves requester IP from proxy headers for rate limiting.
- `src/lib/data/home.ts`, `src/lib/data/about.ts` — Prisma query functions kept separate from components (`server-only` guarded).
- `src/lib/data/club-info.ts` — static editorial content (history, mission/vision, safety guidelines, timeline) for the About page.

**Contact form** (`src/app/contact/actions.ts`) persists to `Contact`, rate-limits by IP, and creates a `Notification` for every Admin/Super Admin/Blog Author so new inquiries surface in the admin dashboard activity feed once it ships in Phase 6.

---

## License

Proprietary — © Royal Nomad Riders Club. All rights reserved.
