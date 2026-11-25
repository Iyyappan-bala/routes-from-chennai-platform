# Codex Tasks — Prioritized Backlog

Read `CODEX_HANDOVER.md` and `CODEX_RULES.md` first. Do not rebuild from scratch — every item
below is a change to the existing, working codebase at commit `dedac17`.

## P0 — Critical

1. **Resolve MapLibre production worker loading / map tile rendering.**
   Reproduce first: `npm run build:vinext && npm run start:vinext`, open any destination detail
   page (e.g. `/destinations/detail/marina-beach`), check browser console for
   `Error: Worker failed to load`. The marker renders; tiles do not. Likely fix involves explicit
   worker bundling config for `maplibre-gl` under Vite (research current `maplibre-gl` + Vite
   integration docs for this specific version — do not assume older Webpack-era solutions apply).

2. **Implement server-side admin authentication and authorization.**
   Current state: `/admin` is a client component that checks the session and role in the browser
   and redirects if unauthorized. RLS already enforces the real security boundary at the database
   layer (verified). Add a proper server-side check (e.g. reading the Supabase session server-side
   via `@supabase/ssr` or equivalent cookie-based approach) so an unauthorized request never even
   receives the admin page's HTML/data, as true defense-in-depth. Do not remove or weaken the
   existing client-side check or the RLS policies while doing this — add a layer, don't replace one.

3. **Verify Cloudflare deployment ownership and establish a persistent deployment.**
   The current live URL (`routes-from-chennai-platform.bow-astronaut.workers.dev`) is on a
   temporary, unclaimed Cloudflare account created via `--temporary-account` for testing — it is
   not meant to be the permanent home. This requires a real Cloudflare account login, which is a
   genuine blocker needing the project owner's involvement (credentials/OAuth), not something to
   work around. Stop at this boundary and ask, per `CODEX_RULES.md`.

## P1 — Production readiness

- Add automated tests (unit/integration/E2E) — none exist beyond the manual scripts in `scripts/`.
- Improve error handling and loading states across all pages (current error states are minimal —
  e.g. destinations/stories pages show a generic message on Supabase query failure).
- Re-verify database RLS policies after any schema change — re-run
  `node scripts/test-cloud-auth-rls.mjs` (safe: creates and deletes its own throwaway test user).
- Security and accessibility audit — no formal audit has been done yet beyond basic semantic HTML,
  skip-link, and focus-visible styles already in `app/globals.css`.
- Establish a reliable, repeatable deployment workflow (currently manual CLI commands only).

## P2 — Product development

- Improve destination discovery (pagination, sorting, richer filters).
- Expand destination and travel-story content — **only using real, verifiable facts**, following
  the same standard as the existing 3 destinations (do not invent descriptions, reviews, or
  statistics for new content).
- Improve media management (currently: `media_assets` table and RLS exist; no actual upload UI has
  been built yet).
- Improve map interactions once P0 item 1 is resolved.
- Prepare Release 2 features: public visitor accounts, saved destinations/stories, personalization,
  analytics — all currently out of scope by design, not forgotten.
