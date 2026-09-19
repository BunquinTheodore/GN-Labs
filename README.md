# GN Labs

## 1. Overview

GN Labs is the applied-AI studio site in the GN Ventures family (alongside
GN Club, GN Academy, and GN Media). It positions GN Labs as a small studio
that scopes, builds, and hands off practical AI integrations and
automations for growing businesses, and it exists to (a) explain that
offering, (b) capture leads through a "Book a Consultation" form, and (c) run
a minimal job board (browse roles, post a role for review, join a talent
list). The audience is two-sided: prospective business clients looking for
AI integration help, and prospective hires/freelancers looking at GN Labs
job listings.

## 2. Stack

- **Framework:** Next.js 16.3.5 (App Router, TypeScript, Turbopack dev
  server) on React 19.2.8 / react-dom 19.2.8.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`, with design
  tokens defined using `@theme inline` in `app/globals.css` (a custom
  glassmorphism material system: `.glass`, `.glass-strong`, `.glass-nav`,
  with `prefers-reduced-transparency` and `prefers-reduced-motion`
  fallbacks). Dark-first, single theme (no light mode toggle).
- **Component system:** shadcn/ui (`base-nova` style preset per
  `components.json`) built on `@base-ui/react` primitives, plus
  `class-variance-authority` for variants. Local UI primitives live in
  `components/ui/` (`badge.tsx`, `button.tsx`, `input.tsx`, `label.tsx`,
  `select.tsx`, `separator.tsx`, `textarea.tsx`) — note there is no
  `card.tsx`; card-style surfaces use the custom `GlassCard` component
  instead.
- **Icons:** `lucide-react`.
- **Fonts:** `next/font/google` (self-hosted at build, not linked
  Google Fonts) — Geist for body text, Space Grotesk for display/headings.
- **Backend/CMS/forms:** No CMS and no external backend/database. All
  three forms (consultation, post-a-job, join-talent-list) post to local
  Next.js Route Handlers under `app/api/`:
  - `POST /api/consultation` validates input and only **logs** submission
    metadata server-side (`app/api/consultation/route.ts`) — there is no
    email, CRM, or calendar integration behind it yet.
  - `POST /api/jobs/post` and `POST /api/jobs/join` validate input and
    append JSON records to flat files (`data/job-requests.json`,
    `data/talent.json`) via `lib/jobs.ts` using Node's `fs.promises`. This
    only works on a persistent, writable Node process (e.g. `next dev` or
    `next start` on a normal server/container) — it will silently fail to
    persist on ephemeral/read-only serverless or edge runtimes, a
    limitation the routes surface honestly (`success: false`) rather than
    faking success.
  - There is no authentication/accounts system and no database.

## 3. Structure

### Route map

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Home: hero with "Book a Consultation" / "See services" CTAs, three-pillar feature grid (Process automation / AI integration / Measurable rollout), and an About-teaser section. |
| `/about` | `app/about/page.tsx` | About page: mission blurb, team-photo placeholder slot, two "values" cards. |
| `/services` | `app/services/page.tsx` | Services page: 3-step approach (Scope / Pilot / Rollout) plus an explicit "detailed service list: to be confirmed" placeholder card linking to `/consultation`. |
| `/consultation` | `app/consultation/page.tsx` | Consultation booking form page (renders `ConsultationForm`). |
| `/jobs` | `app/jobs/page.tsx` | Job listing page; reads `data/jobs.json` via `lib/jobs.ts`; shows an empty state if there are no jobs, and an "Example" badge/banner when listings are placeholders. |
| `/jobs/[slug]` | `app/jobs/[slug]/page.tsx` | Job detail page; 404s via `notFound()` for an unknown slug; statically generated slugs via `generateStaticParams`. |
| `/jobs/post` | `app/jobs/post/page.tsx` | "Post a job" request form (renders `JobPostForm`); submissions require manual admin approval. |
| `/jobs/join` | `app/jobs/join/page.tsx` | "Join the talent list" form (renders `TalentJoinForm`). |
| `POST /api/consultation` | `app/api/consultation/route.ts` | Validates and logs a consultation request; no real integration. |
| `POST /api/jobs/post` | `app/api/jobs/post/route.ts` | Validates and appends a pending job-post request to `data/job-requests.json`. |
| `POST /api/jobs/join` | `app/api/jobs/join/route.ts` | Validates and appends a talent signup to `data/talent.json`. |

### Key directories

- `components/` — `site-nav.tsx` (sticky glass nav with accessible mobile
  menu), `site-footer.tsx`, `glass-card.tsx` (shared glass surface used in
  place of a `Card` component), `consultation-form.tsx`,
  `job-post-form.tsx`, `talent-join-form.tsx`.
- `components/ui/` — shadcn/ui primitives (badge, button, input, label,
  select, separator, textarea).
- `lib/jobs.ts` — flat-file data access layer: `getJobs`, `getJobBySlug`,
  `appendJobRequest`, `appendTalentSignup`; falls back to an empty array
  and logs a warning if a JSON data file is missing/unreadable.
- `lib/utils.ts` — re-exports `cn` from the `cn` package.
- `data/` — `jobs.json` (3 example listings), `talent.json` (`[]`),
  `job-requests.json` (`[]`); these are the "database" for the job board.
- `app/globals.css` — design tokens (`--brand-primary` = cyan,
  `--brand-secondary` = lime, `--brand-tertiary` = amber, shared with the
  GN family palette) and the glass material system.

## 4. What exists

- Fully built marketing home page (`/`) with hero, 3-pillar feature grid,
  and an About teaser section — content is real copy, not lorem ipsum.
- `/about` and `/services` pages with real copy for the parts that are
  decided (mission, values, 3-step engagement approach).
- A working, client-validated + server-validated **consultation form**
  (`components/consultation-form.tsx` + `/api/consultation`) with loading,
  success, and error states, and a budget-range `Select` plus optional
  date field.
- A working **job board v1**:
  - Listing page with populated vs. empty states.
  - Job detail page with static params generation and a 404 for unknown
    slugs.
  - "Post a job" form that submits to a moderation queue
    (`data/job-requests.json`, `status: "pending"`) rather than publishing
    immediately — there is no live job to `data/jobs.json` publishing path.
  - "Join the talent list" form that appends to `data/talent.json`.
  - 3 clearly TODO-labeled example job listings, marked `isExample: true`
    and shown with an "Example" badge in the UI, plus a page-level amber
    notice when any listing is an example.
- Responsive, accessible site nav (`components/site-nav.tsx`): keyboard
  (Escape) close, click-outside close, auto-close on viewport resize past
  the `md` breakpoint, `aria-expanded`/`aria-controls`/`aria-label` on the
  mobile toggle.
- Dark-first glassmorphism design system in `app/globals.css` with
  `prefers-reduced-transparency` and `prefers-reduced-motion` fallbacks.
- Honest failure handling on the two filesystem-backed API routes: if the
  write fails, the route logs a minimal placeholder record and returns
  `success: false` with a clear message, instead of a fake success.
- A very thorough `PLAN.md` already documenting the architecture, the flat
  JSON data-store decision and its filesystem/serverless limitation, the
  API contracts, and the open items list below (largely mirrored here).

## 5. What's missing / known gaps

- **`/services` has no confirmed offering list.** `app/services/page.tsx`
  (lines 71–77) contains an explicit `TODO(open item)` comment and renders
  a placeholder "Detailed service list: to be confirmed" card instead of
  real packages/pricing tiers. No pricing or package data exists anywhere
  in the codebase.
- **No real job listings.** All three entries in `data/jobs.json` are
  TODO-marked (`"TODO: placeholder example listing only..."` in both
  `summary` and `description` for every entry), with fake companies named
  "Example Company (placeholder)" and `isExample: true`. These must be
  replaced or removed before the job board is treated as live; there is
  currently no real job in the system.
- **No team photo.** Both `app/page.tsx` (lines 123–129) and
  `app/about/page.tsx` (lines 37–42) have a code comment describing an
  icon placeholder slot (`<Users>` icon) to be swapped for
  `public/team-01.jpg` once a real photo exists. `public/` currently only
  contains the default `create-next-app` SVGs (`file.svg`, `globe.svg`,
  `next.svg`, `vercel.svg`, `window.svg`) plus `favicon.ico` — no team
  photo has been added.
- **Consultation form has no real backend.** `app/api/consultation/route.ts`
  validates input and does `console.log` of metadata only (never the raw
  message or contact info) — there is no email send, CRM write, or
  calendar booking. A submitted consultation request is not actually
  followed up on by any automated system.
- **Job board has no admin/moderation UI.** Approving a pending
  `data/job-requests.json` entry into `data/jobs.json`, or reviewing
  `data/talent.json` signups, is a fully manual, out-of-band process —
  there is no `/admin` route or any UI for this anywhere in `app/`.
- **Flat-file job board storage won't survive most production
  deployments.** `lib/jobs.ts` reads/writes local JSON files with
  `fs.promises`; this breaks (writes are lost) on ephemeral or read-only
  filesystem targets such as typical serverless/edge deployments (e.g.
  Vercel's default functions). No datastore migration has been done yet.
- **Nav has no link to `/`'s "About" anchor consistency check**: the
  home page has an `id="about"` section (`app/page.tsx` line 120) that
  duplicates the separate `/about` route's content almost verbatim —
  worth deciding whether the home-page About section should just summarize
  and link to `/about`, or whether `/about` is redundant.
- **No sitemap/robots/OG image handling** — no `app/sitemap.ts`,
  `app/robots.ts`, or Open Graph image (`opengraph-image`) were found;
  only per-page `<title>`/`<description>` metadata exists.
- **No automated tests.** No test files, no test runner configured in
  `package.json` (`scripts` only has `dev`, `build`, `start`, `lint`).
- **No CI config** was found in the repo (no `.github/workflows`, etc.).
- **Accessibility notes:**
  - Icon-only mobile menu button (`components/site-nav.tsx`) correctly
    has `aria-label`/`aria-expanded`/`aria-controls` — good — but no
    similar audit was done on the `Select` component's accessible name
    beyond the paired `<Label htmlFor="budgetRange">`.
  - Form error messages (`FieldError` components in all three forms) are
    rendered as plain text next to inputs but are not wired via
    `aria-describedby` to the corresponding `<Input>`/`<Textarea>`, so a
    screen reader focused on the field will not automatically announce
    the associated error text.
  - No skip-to-content link before `<SiteNav>` in `app/layout.tsx` for
    keyboard users to bypass the nav.
- **`data/talent.json` and `data/job-requests.json` are unversioned,
  human-editable JSON acting as a datastore** — fine for v1 per `PLAN.md`,
  but there's no backup/concurrency handling if two submissions race
  (the `appendJsonRecord` read-modify-write in `lib/jobs.ts` is not
  atomic/locked).

## 6. Dev

From `package.json`:

```bash
npm install
npm run dev     # next dev (Turbopack) — starts the local dev server
npm run build   # next build — production build
npm run start   # next start — run the production build
npm run lint    # eslint
```

No custom port is configured anywhere in the repo (no `.env`, no
`-p`/`PORT` flag in `package.json` scripts, no hardcoded port in
`next.config.ts`), so `npm run dev` uses Next.js's default dev port,
**http://localhost:3000**. `PLAN.md`'s "Verification performed" section
confirms `npm run dev` / `next start` were checked against `/`,
`/services`, `/consultation`, `/jobs`, `/jobs/post`, and `/jobs/join`,
all returning HTTP 200, consistent with the default port.
