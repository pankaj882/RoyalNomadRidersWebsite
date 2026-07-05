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
- (Optional) A free [Resend](https://resend.com) account for transactional email — registration confirmation emails (Phase 5) are skipped gracefully with a console warning if this isn't configured, so it's not required to run the site.

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
5. **Storage** — create a public bucket named `gallery` under **Storage** (Storage → New Bucket → name `gallery` → Public: **ON**). Then run `supabase/storage-policies.sql` in the SQL Editor to restrict uploads/deletes to Admin/Super Admin accounts while keeping read access public.

### Creating your first Super Admin

1. Register an account through the app at `/register`.
2. Confirm the email (check inbox for the Supabase confirmation link).
3. Promote the account to Super Admin via the Supabase SQL Editor:
   ```sql
   update public.users set role = 'SUPER_ADMIN' where email = 'you@example.com';
   ```
4. Sign in — you'll now have full `/admin` access, including **Users** (`/admin/users`), where every subsequent role change can be made through the UI instead of SQL.

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
│   │   ├── gallery/                    # Public gallery listing (search/filter) + [slug] album detail + lightbox
│   │   ├── blog/                         # Public blog listing (search/filter/pagination) + [slug] post detail
│   │   ├── events/                         # Public events listing (upcoming + past archive) + [slug] detail/registration
│   │   ├── admin/gallery/                # Admin gallery CMS: album list, new album, per-album photo manager
│   │   ├── admin/blog/                     # Admin blog CMS: list, new/edit editor, categories
│   │   ├── admin/events/                     # Admin event CMS: list, new/edit, registrations table + CSV export
│   │   ├── admin/contact/                      # Contact submission management (status: New/In Progress/Resolved/Archived)
│   │   ├── admin/users/                         # User role management, activation, About-page display (Super Admin only)
│   │   ├── admin/notifications/                  # markNotificationReadAction / markAllNotificationsReadAction
│   │   ├── api/
│   │   │   ├── auth/me/                # Client-fetched current-user endpoint (see Phase 2 notes)
│   │   │   ├── newsletter/              # Newsletter subscribe route handler
│   │   │   ├── blog/[slug]/              # view/like-status/comments — client-fetched, see Phase 4 notes
│   │   │   ├── admin/events/[eventId]/export/  # CSV registrations export (Route Handler, not a Server Action)
│   │   │   ├── admin/notifications/            # Notification bell data endpoint
│   │   │   └── cron/archive-events/            # Daily Vercel Cron target — see Phase 5 notes
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
│   │   ├── gallery/                  # AlbumCard, AlbumImageGrid, ImageLightbox
│   │   ├── blog/                       # LikeButton, CommentSection/Form/Item, ShareButtons, ViewTracker, RelatedPosts, BlogContent
│   │   ├── events/                       # RegistrationForm, PastEventCard
│   │   ├── admin/gallery/              # AlbumForm, BulkUploader, ImageManagerGrid, EditImageDialog
│   │   ├── admin/blog/                   # BlogEditorForm, RichTextEditor, CoverImageUploader, CategoryManager
│   │   ├── admin/events/                   # EventForm, EventCoverUploader, RegistrationsTable, EventRowActions
│   │   ├── admin/contact/                    # ContactRow (view + status dialog)
│   │   ├── admin/users/                        # UserTable, FounderDisplayDialog
│   │   ├── admin/notification-bell.tsx           # Notification bell dropdown, self-fetching + polling
│   │   ├── contact/                 # ContactForm, ContactInfo, MapEmbed
│   │   ├── shared/                    # Logo, SectionHeading, AnimatedContainer, BlogCard, EventCard, EmptyState, ConfirmDialog, Pagination
│   │   └── providers/                  # AuthProvider (client-side session hydration — see Phase 2 notes)
│   ├── lib/
│   │   ├── supabase/           # Browser client, server client, middleware session helper, storage.ts (admin delete)
│   │   ├── validations/         # Zod schemas (auth, contact, gallery, blog, event, registration, user)
│   │   ├── data/                  # Prisma query functions, kept separate from components (incl. admin-dashboard.ts, admin-users.ts, admin-contact.ts, notifications.ts)
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── auth.ts                   # getCurrentUser, requireRole, requireAdminAccess, requireSuperAdmin, etc.
│   │   ├── constants.ts                # Site config, nav links, role labels
│   │   ├── seo.ts                       # Metadata + JSON-LD builders
│   │   ├── email.ts                      # Resend transactional email (registration confirmations)
│   │   ├── instagram.ts                  # Instagram Graph API client
│   │   ├── rate-limit.ts                  # Upstash-backed rate limiting with in-memory fallback
│   │   ├── get-client-ip.ts                # Requester IP resolution for rate limiting
│   │   ├── gallery-storage-shared.ts        # Client+server safe storage path/URL helpers
│   │   ├── gallery-upload.ts                 # Client-side direct-to-Supabase-Storage upload helper
│   │   ├── blog-storage-shared.ts             # Blog cover/content image path helpers (reuses gallery bucket)
│   │   ├── blog-upload.ts                      # Client-side blog image upload helper
│   │   ├── event-storage-shared.ts              # Event cover image path helpers (reuses gallery bucket)
│   │   ├── event-upload.ts                       # Client-side event cover upload helper
│   │   ├── sanitize-html.ts                     # Server-only HTML sanitizer for blog content
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
7. **Cron job:** `vercel.json` registers a daily Cron Job (`/api/cron/archive-events`, 2am UTC) automatically on deploy — available on Vercel's free Hobby plan at daily granularity. Just make sure `CRON_SECRET` is set to the same value in your Vercel project's environment variables as in `.env`; Vercel sends it automatically as a Bearer token for its own scheduled invocations.
8. Add your custom domain under **Project Settings → Domains**, then update `NEXT_PUBLIC_SITE_URL` and the Supabase **Site URL** / **Redirect URLs** to match.

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
- [x] **Phase 2 — Public Pages:** Home (all sections), About, Contact — see [Phase 2 notes](#phase-2-notes).
- [x] **Phase 3 — Gallery:** Albums, upload, lightbox, search/filter, admin CMS — see [Phase 3 notes](#phase-3-notes).
- [x] **Phase 4 — Blog:** Rich text editor, CRUD, categories, comments, likes — see [Phase 4 notes](#phase-4-notes).
- [x] **Phase 5 — Events + Registration:** Event list, registration form, CSV export, confirmation email — see [Phase 5 notes](#phase-5-notes).
- [x] **Phase 6 — Admin Dashboard:** Full stats, role management, unified CMS — see [Phase 6 notes](#phase-6-notes).
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

## Phase 3 Notes

**Public gallery:**
- `/gallery` — album grid with debounced text search and a location filter, both reflected in the URL query string (`?q=...&location=...`) so results are shareable/bookmarkable.
- `/gallery/[slug]` — album detail page with a lazy-loaded image grid and a full-screen lightbox (keyboard arrow-key navigation, click-to-zoom, native Web Share API with clipboard fallback). Prerendered at build time via `generateStaticParams` for every existing album, then served via on-demand ISR (`revalidate = 3600`) for anything created afterward.

**Admin gallery CMS** (`/admin/gallery`):
- Create/edit albums, feature/unfeature from the list view, delete (cascades photos + storage cleanup) with a confirmation dialog.
- `/admin/gallery/[albumId]` — bulk photo uploader (drag-and-drop or multi-select, concurrent uploads capped at 3 in flight, per-file status), inline caption/alt-text editing, and reordering.

**Architecture decision — image reordering uses Move Up/Down, not drag-and-drop:** Reordering is implemented as buttons that swap `sortOrder` with the immediate neighbor (`moveImageAction` in `src/app/admin/gallery/actions.ts`), rather than a drag-and-drop library. This is keyboard-accessible by default and has no touch-event or drop-target edge cases to get wrong — a deliberate reliability trade-off given there's no live browser to test drag interactions against during development. If true drag-and-drop reordering is wanted later, `@dnd-kit` is the recommended addition — swap the button handlers in `ImageManagerGrid` for drag handlers calling the same underlying sort-order-swap logic.

**Architecture decision — uploads bypass Server Actions:** Photos upload directly from the browser to Supabase Storage (`src/lib/gallery-upload.ts`, using the staff member's own authenticated Supabase session) rather than being sent through a Server Action's request body, which has a much lower payload ceiling on Vercel. Only the resulting `{ storagePath, url, altText, width, height }` metadata is sent to `createGalleryImagesAction` to persist the database rows. `src/lib/gallery-storage-shared.ts` holds the storage-path/URL helpers that need to run on both sides (client, for upload; server, for the admin service-role client) — kept separate from `src/lib/supabase/storage.ts`, which is `server-only` and holds the service-role deletion logic.

**Storage RLS:** `supabase/storage-policies.sql` (run once, manually, in the Supabase SQL Editor — Prisma does not manage Storage policies) restricts photo uploads/updates/deletes to Admin/Super Admin accounts while keeping reads public. The app's own delete actions use the service-role client and bypass these policies by design; they exist as defense-in-depth against any direct client-side write attempt.

**New shared library code:**
- `src/lib/data/gallery.ts` — public album/image queries (search, location filter, slug lookup, `generateStaticParams` slug list).
- `src/lib/data/admin-gallery.ts` — admin album/image queries.
- `src/lib/validations/gallery.ts` — Zod schemas for albums, bulk image uploads, and image edits.
- `src/components/shared/confirm-dialog.tsx` — reusable destructive-action confirmation dialog, intended for reuse in Phase 4/5/6 (delete blog, delete event, delete user, etc.).

---

## Phase 4 Notes

**Public blog:**
- `/blog` — listing with debounced search, category filter, and numbered pagination (chosen over infinite scroll for crawlable, bookmarkable, shareable URLs — `?q=...&category=...&page=...`).
- `/blog/[slug]` — full post with sanitized rich content, ride-detail sidebar (location/motorcycle/distance/date), author bio, like button, share buttons (native Web Share API with WhatsApp + copy-link fallbacks), comments (one level of replies), and related posts by category. Prerendered via `generateStaticParams` for every published post, then ISR (`revalidate = 1800`).

**Admin blog CMS** (`/admin/blog`):
- List scoped by role: Admins/Super Admins see every post, Blog Authors see only their own (enforced at the Prisma query level in `getBlogsForAdmin`, not filtered client-side).
- `/admin/blog/new` and `/admin/blog/[blogId]` — the same `BlogEditorForm`: title, excerpt, cover image upload, category, ride metadata (date/location/motorcycle/distance), optional SEO overrides, and the rich text editor. **Save Draft** and **Publish** are separate actions, matching the spec exactly; a published post can be moved back to Draft.
- `/admin/blog/categories` — Admin/Super Admin only (`requireManagementAccess`). Deleting a category doesn't delete or block its posts — `Blog.category` uses `onDelete: SetNull`, so affected posts simply become uncategorized.
- Ownership is enforced server-side in every mutating action (`assertCanEditBlog` in `src/app/admin/blog/actions.ts`), not just hidden in the UI — a Blog Author calling `updateBlogAction`/`deleteBlogAction` on someone else's post id directly gets rejected regardless of what the client sent.

**Rich text editor** (`src/components/admin/blog/rich-text-editor.tsx`) is built on **Tiptap**, covering every format the spec asked for: bold/italic/strikethrough/inline code, headings, bullet & numbered lists, blockquotes, code blocks, links, inline images, and **YouTube video embeds**. Video is embed-only (a URL, not a file upload) — hosting raw video files would eat through Supabase's free-tier storage/bandwidth far faster than photos, so linking to YouTube (already the de facto place riders post ride videos) was the pragmatic choice here.

**Content security:** All HTML from the editor is run through `sanitizeBlogContent()` (`src/lib/sanitize-html.ts`, using `sanitize-html`) at write time, before it's ever stored — allowlisting exactly the tags Tiptap can produce, and restricting embeddable iframes to YouTube hostnames only. This is the actual security boundary; `BlogContent`'s `dangerouslySetInnerHTML` on the read side is a display step, not a filter.

**Likes** use a `BlogLike` join table (`@@unique([blogId, userId])`) as the source of truth — enabling toggle-off and preventing duplicate likes — while `Blog.likeCount` stays a denormalized counter kept in sync transactionally, so list/card views never need to `COUNT()` a join table just to show a number.

**Architecture decision — likes and comments are client-fetched, not embedded in the ISR page:** This follows the same principle as Phase 2's auth decision. `/blog/[slug]` is statically generated and ISR-revalidated, which is great for the post content itself but wrong for two things that are inherently per-user or highly mutable:
- *"Has this visitor liked this post?"* is per-user data. Baking it into the cached page would either leak one visitor's like state to everyone else (wrong) or force the whole page dynamic just for one boolean (defeats ISR). Instead, `LikeButton` fetches `/api/blog/[slug]/like-status` client-side on mount.
- *Comments* need to feel live immediately after posting — but ISR's `revalidate` window means the page's server-rendered props could stay stale for up to 30 minutes. `CommentSection` fetches `/api/blog/[slug]/comments` client-side on mount and again after every post/delete, so new comments appear instantly without touching the page's cache lifecycle at all.

`Blog.likeCount` (an aggregate, not per-user) is the one piece of like/comment-adjacent data that *is* safe to read from the cached page props, since serving it a few minutes stale is a fine trade-off for a "42 likes" counter.

**Known limitation — blog content image cleanup:** Deleting a post does not delete its cover image or any inline content images from Storage. Unlike the gallery (where every image is a tracked `GalleryImage` row), blog content images are embedded as arbitrary `<img>` tags inside free-form HTML, so there's no structured list of "images belonging to this post" to safely garbage-collect from a synchronous delete action. This is a reasonable candidate for a periodic cleanup job (list all objects under `blog/` in Storage, diff against URLs referenced in `Blog.content`/`Blog.coverImageUrl` across all posts, delete the orphans) rather than something to bolt onto `deleteBlogAction`.

**Reused, not duplicated:** Blog cover/content images upload into the same `gallery` Supabase Storage bucket from Phase 3 (under a `blog/covers/` and `blog/content/` prefix — see `src/lib/blog-storage-shared.ts`), so no second bucket or second set of RLS policies is required.

---

## Phase 5 Notes

**Public events:**
- `/events` — upcoming rides (destination, date, meeting point, time, difficulty, distance, ride captain, seats left, Register Now — via the existing `EventCard`), plus a **Past Rides** archive section below it.
- `/events/[slug]` — full ride details and, if registration is open and the ride hasn't happened yet, the complete registration form. Closed/past/cancelled rides show a clear status message instead of the form.

**Registration form** (`src/components/events/registration-form.tsx`) implements every field from the spec exactly: Personal (name, email, phone, age, blood group, emergency contact), Motorcycle (brand, model, registration number, riding experience), Ride Gear checkboxes (helmet/jacket/gloves/boots/knee guards), Medical (allergies, medical conditions), and the required "I agree to ride responsibly" checkbox (enforced with `z.literal(true)` — the form cannot submit without it, server-side, not just a disabled button).

**On submit** (`submitRegistrationAction` in `src/app/events/actions.ts`):
1. Rate-limited by IP (5 submissions/hour) — reuses the same `checkRateLimit` utility from the Phase 2 contact form.
2. Re-checks seat availability **live against the database** at submission time (not against whatever was shown on the possibly-cached page) — if the ride is full, the registration is created with `status: WAITLISTED` instead of `CONFIRMED`, so nobody is silently overbooked.
3. Rejects a duplicate registration (same email, same event).
4. Stores the registration, sends the confirmation email (see below), and notifies every Admin/Super Admin/Blog Author via `Notification`.

**Confirmation email** (`src/lib/email.ts`) uses **Resend** — if `RESEND_API_KEY` isn't configured, the function logs a warning and returns `false` rather than throwing, so a missing email integration never blocks a registration that's already safely stored in the database. `Registration.confirmationEmailSentAt` records whether it actually went out.

**CSV export** (`/api/admin/events/[eventId]/export`) is a Route Handler, not a Server Action — file downloads need real HTTP response headers (`Content-Disposition: attachment`), which Server Actions aren't designed to return. It does its own role check (not `requireManagementAccess()`, which is built to redirect page requests, not return a clean 401/403 for what's essentially a download link).

**Architecture decision — "past events move to archive" is enforced twice, deliberately:**
1. **In real time**, `src/lib/data/events.ts` filters `getUpcomingEventsList`/`getPastEventsList` directly on `startDate` versus `now()` — so a ride that started an hour ago never shows as "upcoming" to a visitor, regardless of whether any background job has run.
2. **In stored data**, a daily Vercel Cron Job (`vercel.json` → `/api/cron/archive-events`, `0 2 * * *`) flips past `UPCOMING` events to `status: COMPLETED, isArchived: true` and closes their registration — keeping the admin dashboard's counts and the `Event.status`/`isArchived` fields themselves correct for reporting, not just for what's rendered.

This means the public site is correct immediately even before the cron job ever runs (deploy today, and an event dated yesterday already shows as "past" on `/events`); the cron job's role is strictly to keep the *stored* status fields in sync for anything that reads them directly. Vercel Cron Jobs are available on the free Hobby plan at daily granularity, which is what the schedule above uses. The route checks a `CRON_SECRET` bearer token (set the same value in both `.env`/Vercel env vars — Vercel automatically sends it as `Authorization: Bearer $CRON_SECRET` for its own scheduled invocations).

**Known limitation:** the registration form does not currently check whether a signed-in user has already registered for a ride under a *different* email address — de-duplication is by email only, matching the spec's field list (there's no requirement to be signed in to register at all; `Registration.userId` is set opportunistically when the submitter happens to be logged in, but registering as a guest is fully supported).

---

## Phase 6 Notes

**Dashboard** (`/admin`) now shows everything the spec asked for, each backed by live Prisma queries in `src/lib/data/admin-dashboard.ts`: 8 stat cards (gallery images, published/draft blogs, upcoming events, total/waitlisted registrations, active users, new contact messages), **Recent Registrations**, **Recent Blog Activity**, and **Upcoming Events** — every row links straight into the relevant management screen.

**Notifications**, created since Phase 2 (contact submissions) and Phase 5 (registrations) but never surfaced until now, are live in a bell icon in the admin header (`src/components/admin/notification-bell.tsx`): unread count badge, list, mark-one or mark-all read, polls every 60 seconds. It self-fetches from `/api/admin/notifications` rather than being fetched in the (already-dynamic) layout, purely so mark-as-read can update the badge instantly without a full page round-trip.

**Contact message management** (`/admin/contact`) — this closes a gap from Phase 2: the contact form already created `Notification` rows linking to an admin contact page, but that page didn't exist until now. Management-role only (`requireManagementAccess`); each message opens in a dialog with a status dropdown (New / In Progress / Resolved / Archived).

**User management** (`/admin/users`, Super Admin only — `requireSuperAdmin`):
- **Role changes** — Super Admin, Admin, Blog Author, Member — with a hard server-side guard preventing a Super Admin from changing their *own* role or deactivating their *own* account (the classic "lock everyone out" footgun). The role select and deactivate button are simply disabled for your own row, and the server action re-checks it independently regardless of what the client sends.
- **Deactivation, not deletion.** There's no "delete user" — `Blog.author`, `Comment.author`, `Registration.user`, `Album.createdBy`, `GalleryImage.uploadedBy`, and `Event.createdBy` are all required, non-nullable foreign keys to `User` without a cascade rule, so deleting a user with any content would either fail outright or silently orphan data depending on the relation. `isActive: false` is the safe equivalent — the account immediately loses the ability to sign in (already enforced by `getCurrentUser()`'s `isActive` check from Phase 1), while every post/comment/registration they've ever made stays intact and correctly attributed.
- **About page display** — the `isFounder`/`founderTitle`/`displayOrder` fields added to `User` back in Phase 2 finally have an editing UI here, via a small dialog per user. This is also where the "Only authorized users can publish blogs" requirement is actually enforced end-to-end: role changes here directly gate `requireAdminAccess`/`assertCanEditBlog` in the blog Server Actions from Phase 4.

---

## License

Proprietary — © Royal Nomad Riders Club. All rights reserved.
