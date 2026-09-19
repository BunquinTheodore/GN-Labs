# GN Labs: site plan

GN Labs is a new AI-integration studio site in the GN Ventures family,
scaffolded with Next.js (App Router), TypeScript, Tailwind CSS v4, and
shadcn/ui, matching the stack used by the sibling GN Club site.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind CSS v4 (`@theme inline` tokens in `app/globals.css`)
- shadcn/ui (`base-nova` preset, base-ui primitives), `components.json` at
  the project root
- Fonts: `next/font/google` (self-hosted at build time, not linked Google
  Fonts), Geist for body text, Space Grotesk for display/headings, matching
  the sibling sites' approach
- Icons: `lucide-react`

## Brand

Shares the GN family accent trio (lime `#c6f24e`, cyan `#33c7e0`, amber
`#f2b84e`) with the sibling GN Club site, but GN Labs leads with **cyan**
as its primary accent (`--brand-primary`) and uses lime as the secondary
highlight and amber as the tertiary accent, so it reads as its own brand
within the family rather than a reskin of GN Club (which leads with lime).
Tokens live in `app/globals.css` (`--brand-primary`, `--brand-secondary`,
`--brand-tertiary`, plus the shared `--lime` / `--cyan` / `--amber` raw
values).

The site is dark-first (single dark theme, no light mode), with a
glassmorphism material system (`.glass`, `.glass-strong`, `.glass-nav` in
`app/globals.css`): `backdrop-filter: blur(20-24px) saturate(150-180%)`,
translucent surfaces, a 1px top-edge inset highlight, and a soft
lime-tinted shadow. `prefers-reduced-transparency: reduce` falls back to a
solid fill; `prefers-reduced-motion: reduce` disables animation/transition
duration globally.

## Site structure

```
app/
  layout.tsx                 Root layout, fonts, nav + footer
  globals.css                Design tokens, glass material system
  page.tsx                   Home: hero (CTA -> /consultation), pillars, about section
  about/page.tsx              /about (also reachable from nav)
  services/page.tsx           /services: AI integration for business, TODO marker for detailed list
  consultation/page.tsx       /consultation: booking form
  api/consultation/route.ts   POST handler, server-side validation, placeholder backend
  jobs/page.tsx                /jobs: listing (handles empty state)
  jobs/[slug]/page.tsx          /jobs/[slug]: job detail
  jobs/post/page.tsx            /jobs/post: "Post a job" request form
  jobs/join/page.tsx            /jobs/join: "Join the talent list" form
  api/jobs/post/route.ts        POST handler, writes to data/job-requests.json (status "pending")
  api/jobs/join/route.ts        POST handler, writes to data/talent.json
components/
  site-nav.tsx, site-footer.tsx, glass-card.tsx
  consultation-form.tsx, job-post-form.tsx, talent-join-form.tsx
  ui/                          shadcn/ui components (button, input, textarea,
                                label, select, card, badge, separator)
lib/
  jobs.ts                      Flat-file data access (read jobs, append requests/signups)
data/
  jobs.json                    Example job listings (TODO-marked placeholders, not real jobs)
  talent.json                  Talent-list signups (starts empty, appended to at runtime)
  job-requests.json            Pending "post a job" submissions (starts empty, status "pending")
```

## Job board v1 scope

Deliberately minimal, per the brief: no payments, no messaging, no
accounts. A submitted job post is not published automatically; it is
stored with `status: "pending"` in `data/job-requests.json` and needs a
human to move it into `data/jobs.json` (there is no admin UI yet, see open
items).

## Job board data approach: flat JSON files on the local filesystem

**Chosen approach:** `lib/jobs.ts` reads `data/jobs.json` for the listing
and detail pages, and the two API routes
(`app/api/jobs/post/route.ts`, `app/api/jobs/join/route.ts`) append
records to `data/job-requests.json` and `data/talent.json` respectively
using Node's `fs.promises`.

**Why:** this is the simplest approach that is still real (not a fake
placeholder) for a v1 with no real jobs, no accounts, and no database yet.
It requires no external service and keeps the data human-readable and
easy to hand-edit while the catalog is small.

**Limitation, stated plainly:** this only works when the app runs on a
persistent Node.js process with a writable filesystem, for example
`next start` on a normal VM or container, or `next dev` locally. It does
**not** work on deployment targets with an ephemeral or read-only
filesystem at runtime (for example Vercel's default serverless functions,
or most edge runtimes) — writes there either fail or do not persist
between invocations/deploys.

Both write routes handle that failure honestly: if the `fs.writeFile`
call throws, the route logs a placeholder record (id, title/role, and
company only, not full submission content) to the server console, returns
a clear `success: false` error to the client instead of a fake success
message, and does not pretend the submission was stored. If GN Labs is
deployed to a serverless/edge target, swap `lib/jobs.ts`'s file I/O for a
real datastore (Postgres, a KV store, etc.) before relying on the job
board in production.

## API contracts

- `POST /api/consultation`: requires `name`, `company`, `email`,
  `automationGoal`; optional `budgetRange`, `preferredDate`. Validates
  server-side, returns `{ success, message, errors? }`. Placeholder
  backend: no email/CRM/calendar integration exists yet; it logs
  submission metadata only (field presence/lengths), never the raw
  message or contact details.
- `POST /api/jobs/post`: requires `title`, `company`, `contactEmail`,
  `location`, `employmentType`, `description` (30+ characters). Writes a
  `status: "pending"` record to `data/job-requests.json`.
- `POST /api/jobs/join`: requires `name`, `email`, `role`; optional
  `skills`, `linkUrl`. Appends to `data/talent.json`.

## Open items for the team

1. **Detailed AI-integration service list.** `/services` currently has a
   TODO-marked placeholder instead of a confirmed list of specific
   integrations/packages/pricing tiers. No such list was confirmed at
   build time.
2. **Real job listings.** `data/jobs.json` currently contains three
   TODO-marked example listings, clearly labeled `isExample: true` and
   shown with an "Example" badge in the UI. They must be replaced or
   removed before the job board is treated as live. No real jobs exist
   yet.
3. **Real team photo.** The About section has a placeholder icon slot
   with instructions in a code comment for where to drop
   `public/team-01.jpg` once a real photo exists. No fabricated or stock
   photo was used.
4. **Job board admin flow.** There is no admin UI yet to approve a
   pending `job-requests.json` entry into `jobs.json`, or to review
   `talent.json` signups. For v1 this is a manual, human-in-the-loop step
   (per the "no accounts" v1 scope); a lightweight internal review tool
   is a reasonable next step once real submissions start arriving.
5. **Production datastore for the job board**, if GN Labs is deployed to
   a platform with an ephemeral/read-only filesystem at runtime (see
   "Job board data approach" above).
6. **Consultation backend.** `/api/consultation` is a validated
   placeholder; connect it to a real inbox/CRM/calendar before relying on
   it to actually schedule consultations.

## Verification performed

- `npm install` and `npm run build` from `C:\GN Ventures\GN Labs`
  complete with no TypeScript or JSX errors (see build output).
- `npm run dev` (or `next start` after build) confirmed `/`, `/services`,
  `/consultation`, `/jobs`, `/jobs/post`, `/jobs/join` all return HTTP 200.

## Session update (2026-09-20) — real logo + rebrand, glass/shine polish

1. **Rebranded around the real "gn LABS" logo** the client supplied
   (lowercase "gn" + "LABS" wordmark, lime-green, black background,
   blue-to-yellow gradient rounded-rect border). Verified pixel-consistent
   with GN Academy's logo (same container shape, gradient border, glyph
   shape/weight, near-identical lime tone) before using it. Added at
   `public/brand/gn-labs-logo.png`, wired into `app/icon.png`,
   `app/favicon.ico`, and `components/site-nav.tsx`. Color tokens in
   `app/globals.css` (`--lime`/`--cyan`/`--amber`, `--brand-primary`, etc.)
   were re-sampled from the actual logo pixels rather than reusing the
   earlier placeholder values noted in this file's "Brand" section above —
   lime is now the lead accent (was cyan-led). Font switched from Space
   Grotesk to Google's Outfit (`next/font/google`) for display/heading text
   — its rounded terminals pair better with the wordmark's single-story
   rounded "gn" than Space Grotesk's flatter cuts.
2. **Typography pass** — `text-balance` + explicit line-heights added to
   h1-h4 in `app/globals.css` (fixes Tailwind's near-1.0 default leading on
   large wrapped headings), body line-height 1.55 → 1.6, `p { text-wrap:
   pretty }`. Audited all copy for em/en dashes used as sentence punctuation
   — found zero instances; existing hyphens were all legitimate
   (AI-powered, ml-ops, etc.), so no copy changes were needed here.
3. **Glass/shine on cards and buttons.** Extended the existing `.glass`
   system (see "Brand" section above) rather than replacing it: a
   `shine-sweep` keyframe (diagonal light sweep, `mix-blend-mode: overlay`)
   and a `glass-glow-pulse` keyframe (pulses the existing lime-tinted
   shadow) applied to `.glass`/`.glass-strong` — this auto-covers every
   `GlassCard` (service, job, feature cards) — plus a new `.button-glass`
   class wired into `components/ui/button.tsx`'s variants. Both respect
   `prefers-reduced-motion` (freeze to a settled glow/fixed sweep position)
   and `prefers-reduced-transparency` (solid fallback).
   - Cards specifically also got a hover-zoom: `GlassCard`
     (`components/glass-card.tsx`) now carries an additional `glass-card`
     class (scoped separately from the badge pill and mobile-nav sheet,
     which also use the base `.glass` class but aren't cards), with
     `transform: scale(1.03)` on hover, respecting reduced motion.
4. **Continuously animating ambient background**, `app/layout.tsx`: a fixed
   `.ambient-bg` layer with three blurred radial-gradient blobs (lime/cyan/
   amber) drifting via independent `translate`/`scale` keyframes over
   46-64s, plus a faint drifting grid overlay, pure CSS, `z-index: -1`.
   Freezes to a static offset under `prefers-reduced-motion`.
5. **Nav bar**: desktop and mobile nav links now uppercase with
   `tracking-[0.12em]` (`components/site-nav.tsx`), desktop link gap
   widened `gap-6` → `gap-9`.

### Design-language note

Items 2-5 above match a house design direction established this session
across the whole GN Ventures family (bright glass, continuous subtle shine,
brighter buttons, uppercase/tracked nav, no em dashes) — see the top-level
`PLAN-OVERVIEW.md` session-log section for the full statement. Apply it by
default to any future visual work on this site.
