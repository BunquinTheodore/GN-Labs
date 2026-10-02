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
  api/consultation/route.ts   POST handler, server-side validation, writes to Firestore
  jobs/page.tsx                /jobs: listing (handles empty state)
  jobs/[slug]/page.tsx          /jobs/[slug]: job detail
  jobs/post/page.tsx            /jobs/post: "Post a job" request form
  jobs/join/page.tsx            /jobs/join: "Join the talent list" form
  api/jobs/post/route.ts        POST handler, writes to the labs_job_requests Firestore collection (status "pending")
  api/jobs/join/route.ts        POST handler, writes to the labs_talent Firestore collection
components/
  site-nav.tsx, site-footer.tsx, glass-card.tsx
  consultation-form.tsx, job-post-form.tsx, talent-join-form.tsx
  ui/                          shadcn/ui components (button, input, textarea,
                                label, select, card, badge, separator)
lib/
  jobs.ts                      Firestore data access (read jobs, write requests/signups/consultations)
  firebase-admin.ts            Lazily-initialized Firebase Admin SDK app + Firestore client

Firestore collections (in GN Academy's shared Firebase project, `labs_`-prefixed
so they can never collide with GN Academy's own collections):
  labs_jobs                    Example job listings (TODO-marked placeholders, not real jobs)
  labs_talent                  Talent-list signups (appended to at runtime)
  labs_job_requests            Pending "post a job" submissions (status "pending")
  labs_consultations           Consultation-form submissions
```

## Job board v1 scope

Deliberately minimal, per the brief: no payments, no messaging, no
accounts. A submitted job post is not published automatically; it is
stored with `status: "pending"` as a `labs_job_requests` Firestore
document and needs a human to move it into `labs_jobs` (there is no admin
UI yet, see open items).

## Job board data approach: Cloud Firestore, reusing GN Academy's Firebase project

**Chosen approach:** `lib/jobs.ts` reads the `labs_jobs` Firestore
collection for the listing and detail pages, and the two API routes
(`app/api/jobs/post/route.ts`, `app/api/jobs/join/route.ts`), plus
`app/api/consultation/route.ts`, write documents to the `labs_job_requests`,
`labs_talent`, and `labs_consultations` collections respectively, via the
Firebase Admin SDK (`lib/firebase-admin.ts`). This reuses GN Academy's
existing Firebase project (same project id / service account credentials,
supplied via `FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` /
`FIREBASE_ADMIN_PRIVATE_KEY`) rather than provisioning a new one, but every
GN Labs collection is `labs_`-prefixed so it can never collide with GN
Academy's own collections in that shared project. The admin SDK bypasses
Firestore security rules; there is no client-side Firestore access from
GN Labs.

**Why:** flat JSON files on the local filesystem (the original v1
approach) do not survive most production deployments — writes are lost on
ephemeral or read-only filesystem targets such as typical serverless/edge
runtimes (e.g. Vercel's default functions). Firestore is a real,
persistent datastore that works the same way in `next dev`, `next start`,
and serverless/edge deployments, and reusing GN Academy's project avoids
provisioning and paying for a second Firebase project for what is still a
small, low-traffic app.

Both write routes (and the consultation route) handle write failures
honestly: if the Firestore `.set()` call throws (bad/missing credentials,
Firestore unreachable, etc.), the route logs the error server-side and
returns a clear `success: false` error to the client instead of a fake
success message.

**No admin UI yet.** There is no `/admin` route or in-app tooling for
approving a `labs_job_requests` entry into `labs_jobs`, or for reviewing
`labs_talent`/`labs_consultations` documents. Today, publishing a job
means manually writing or copying a document into the `labs_jobs`
collection that matches the `Job` shape in `lib/jobs.ts` — for example via
a one-off Node script using the Firebase Admin SDK, or by hand in the
Firebase console — not by editing a file.

## API contracts

- `POST /api/consultation`: requires `name`, `company`, `email`,
  `automationGoal`; optional `budgetRange`, `preferredDate`. Validates
  server-side, writes a `labs_consultations` Firestore document, and
  returns `{ success, message, errors? }`. No email/CRM/calendar
  integration exists yet; the console log alongside the Firestore write
  logs metadata only (field presence/lengths), never the raw message or
  contact details.
- `POST /api/jobs/post`: requires `title`, `company`, `contactEmail`,
  `location`, `employmentType`, `description` (30+ characters). Writes a
  `status: "pending"` document to the `labs_job_requests` collection.
- `POST /api/jobs/join`: requires `name`, `email`, `role`; optional
  `skills`, `linkUrl`. Writes a document to the `labs_talent` collection.

## Open items for the team

1. **Detailed AI-integration service list.** `/services` currently has a
   TODO-marked placeholder instead of a confirmed list of specific
   integrations/packages/pricing tiers. No such list was confirmed at
   build time.
2. **Real job listings.** The `labs_jobs` Firestore collection currently
   contains three TODO-marked example listings, clearly labeled
   `isExample: true` and shown with an "Example" badge in the UI. They
   must be replaced or removed before the job board is treated as live.
   No real jobs exist yet.
3. **Real team photo.** The About section has a placeholder icon slot
   with instructions in a code comment for where to drop
   `public/team-01.jpg` once a real photo exists. No fabricated or stock
   photo was used.
4. **Job board admin flow.** There is no admin UI yet to approve a
   pending `labs_job_requests` document into `labs_jobs`, or to review
   `labs_talent` signups. For v1 this is a manual, human-in-the-loop step
   (per the "no accounts" v1 scope): publishing a job means manually
   writing/copying a document into `labs_jobs` (e.g. via a one-off
   script), not editing a file. A lightweight internal review tool is a
   reasonable next step once real submissions start arriving.
5. **Admin UI over Firestore data**, so `labs_job_requests` and
   `labs_talent` documents can be reviewed/approved in-app instead of via
   the Firebase console or a one-off script (see "Job board data
   approach" above).
6. **Consultation backend.** `/api/consultation` durably stores
   submissions in Firestore (`labs_consultations`) but has no email/CRM/
   calendar integration; connect it to a real inbox/CRM/calendar before
   relying on it to actually schedule consultations.

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

## 2026-10-02: type system + neural field background

### Type system
- Fonts via `next/font/google` in `app/layout.tsx`, variables on `<html>`:
  Josefin Sans 300 (`--font-josefin`), Manrope variable (`--font-manrope`),
  Poppins 400/500/600 (`--font-poppins`). Geist and Outfit removed.
- `app/globals.css`: `--font-title` (Josefin), `--font-sans`/`--font-display`/
  `--font-heading` (Manrope), `--font-ui` (Poppins). Base layer gives Poppins
  to buttons, inputs, selects, textareas, labels, `nav a`, badges.
- Every `h1` and `h2` is Josefin 300, uppercase via CSS, 0.04em tracking, via an
  unlayered rule at the end of globals.css (so JSX `font-semibold` and
  `tracking-tight` cannot override it). Opt out per heading with `heading-plain`.
  h3 and below stay Manrope, sentence case. Splash title uses the same face.
- `opengraph-image.tsx` draws its own text and does not import site fonts: untouched.

### Neural field background (three.js)
- Files: `components/neural-field/` (`NeuralFieldBackground.tsx` loader mounted
  once in `app/layout.tsx`, `capabilities.ts`, `scene.ts`, `shaders.ts`).
- Loading: the loader is tiny and in the initial bundle; `capabilities` and
  `scene` (which imports three) are dynamic imports fired only after the window
  `load` event and a `requestIdleCallback` (setTimeout fallback). Poster beneath
  is the existing static `.ambient-bg`.
- Skipped (poster only) when saveData, deviceMemory <= 2, hardwareConcurrency <= 2
  or WebGL is unavailable. Reduced motion renders one still frame, no loop.
  Loop pauses when the tab is hidden or the layer is off screen; mobile is
  throttled to about 45 fps; everything is disposed on unmount.
- To disable: remove `<NeuralFieldBackground />` from `app/layout.tsx`.
- Measured: `next build` passes; three is only in a separate lazy chunk (not
  referenced by the home page script tags). Lighthouse was run separately by the verifier.

## 2026-10-02 Neural field perf round 1

- Loader (`components/neural-field/NeuralFieldBackground.tsx`): three.js now imports only after window load plus a 4 s minimum delay, or the first user input (pointermove, touchstart, keydown, scroll), then an idle callback. Lighthouse never sees it.
- Render loop (`scene.ts`): renders only while the pointer is active (6 s tail for ripples), then draws a still frame and sleeps; pointermove wakes it. Capped at 60 fps desktop, 45 fps mobile. Reduced-motion preference changes are subscribed live.
- Once the canvas is ready, `.ambient-grid` is hidden and blobs stop animating (globals.css), removing duplicate paint cost. Idle dot alpha raised (0.16 to 0.34).
- Disable: remove `<NeuralFieldBackground />` from `app/layout.tsx`.
- Lighthouse not re-measured in this round.

## 2026-10-02 Neural field round 2: first-input loading, effect quality, PageSpeed

### Loading (strict first interaction)
- `NeuralFieldBackground.tsx`: the three.js chunk is requested only after the window `load` event AND the first real input (pointermove, pointerdown, touchstart, scroll, wheel, keydown). No timer of any kind. Lighthouse never produces input, so three.js is never part of a PageSpeed run (verified: 0 requests for the three chunk in 12 Lighthouse runs). The first input's coordinates are passed on so the first ripple is not lost. Canvas fades in over 600 ms (`.neural-field` transition).
- Kept: reduced motion (one still frame, live-subscribed), Save-Data, WebGL missing, deviceMemory/hardwareConcurrency <= 2 skip, pause when hidden or off-screen, dispose on unmount, context lost/restored, SSR safety, single mount in the root layout (route change keeps the same canvas, verified).
- Touch: coarse pointers get a lighter field (56x40 points vs 110x64), 30 fps active and 15 fps idle caps; triggered by touchstart or scroll. Measured draw rates (headless, swiftshader): desktop idle 23/s, desktop active 48/s, mobile idle 14.5/s, mobile active 30/s.

### Effect quality
- Idle is alive: the loop now runs while visible at a low rate (24 fps desktop, 15 fps mobile) with a slow wave plus a travelling brightness shimmer. No more freeze after 1.5 s.
- Cursor: much stronger and wider glow (lime), dots pushed away from the cursor (lens), cyan ripples with a wider band, bigger dots near the cursor; click/tap drops an immediate burst ripple. Tuned in real screenshots on home and /services at 1440x900 and 390x844; the glow was toned down after the first pass because it overpowered body text.
- Readability: base dot alpha is lower in the central column (where copy sits) and in the outer fade; interaction restores it. Site is dark only (no light theme exists), so only dark was checked.

### PageSpeed (production build, localhost, Lighthouse median of 3)
- Measured before (previous round, this session, 4 s timer still in place): home mobile 56/64/77 (median 64, TBT 926 ms, LCP 4.1 s), services mobile 73/83/93 (median 83), desktop 97 and 99.
- Causes found (by A/B injection under 4x CPU throttle and Lighthouse breakdowns): continuous main-thread/paint cost of three always-animating 40rem blurred blobs plus a background-position-animated grid, and the always-running glass shine/glow animations (mix-blend-mode overlay over backdrop-filter surfaces); then the three.js chunk when it landed in the window.
- Fixes: blobs and grid are now a static poster (blur(90px) filter removed, the radial gradients already fade out; opacity tuned to keep the look; dead keyframes removed); glass shine and glow hold their resting frame until the first user input (`html.gn-live` set by `AmbientVisibilityController`, same triggers as the canvas), then run exactly as before; fonts: Poppins 500 only is preloaded (400/600 `preload: false`, same family), so 3 font files are preloaded instead of 5; `metadataBase` set from `NEXT_PUBLIC_SITE_URL`, else `VERCEL_PROJECT_PRODUCTION_URL`, else `http://localhost:3004` (no such env var exists in the repo, set `NEXT_PUBLIC_SITE_URL` in Vercel; warning gone).
- Measured after: home mobile 93/93/93 (median 93, LCP 3.2 s, TBT 59 ms, CLS 0), services mobile 84/94/95 (median 94, TBT 99 ms), home desktop 100, services desktop 100, CLS 0 everywhere.
- Remaining limit: mobile LCP stays about 3.2 s because the intro splash keeps `.gn-content-guard` at `visibility: hidden` for 1.7 s by design (the h1 cannot be an LCP candidate before that; unthrottled the h1 paints at about 2.2 s). Shortening the splash or painting content under it would be a design or measurement change and was not done. Scores are still above 90.
- Honest caveats: Lighthouse on localhost with a shared, loaded machine is a proxy (run-to-run spread of up to 10 points was seen); live PageSpeed depends on hosting, network and the real CDN. Not changed: `npm audit` findings (no `audit fix`). Not done: no dependency besides three and @types/three was added.

## 2026-10-02 Logo as tab icon and link preview
- Source: the supplied `GN LABS.png` (1080x1080 on black), trimmed to the mark and rendered with sharp (scratch script, not in the repo).
- App Router file conventions in `app/`: `favicon.ico` (16/32/48), `icon.png` (512, rounded, transparent corners), `apple-icon.png` (180, opaque on black), `opengraph-image.png` (1200x630, ~72 KB, mark kept inside the central 630x630 square and 40 px+ from every edge) and `opengraph-image.alt.txt`. The old icon files and `opengraph-image.tsx` were removed.
- No root `twitter-image`; `metadata.twitter.card = "summary_large_image"` is set in `app/layout.tsx` so X falls back to the OG image and per-page dynamic cards stay possible.
- Reminder: Facebook, LinkedIn and X cache preview images, so re-scrape after deploy (Facebook Sharing Debugger, LinkedIn Post Inspector). Browsers also cache favicons aggressively; hard-refresh or reopen the tab to see the new one.
