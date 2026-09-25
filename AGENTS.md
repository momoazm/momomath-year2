# Momo Year 2 Cambridge — momomath-year2

Vite + React + TS + Tailwind, zustand persist store, vitest. Deploys to GitHub Pages (`/momomath-year2/`) via `node scripts/deploy.mjs`.

## NEVER FORGET THE PLAN (mandatory, every session)

1. At session start, read `PLAN.md` in this repo BEFORE touching code. The full active plan lives there — do not rely on chat memory, chats get compacted/lost.
2. Work top-to-bottom through the plan's phases; when a session ends mid-plan, update `PLAN.md` checkboxes/progress so the next session resumes exactly where this one stopped.
3. Never drop, skip, or "simplify away" plan steps without the user explicitly approving the change in chat. Every numbered step ships or gets an explicit user-approved cut.
4. Before commit/deploy, diff your work against `PLAN.md` step by step — if a step has no corresponding change, stop and finish it first.

## Deploy rule (standing, user-mandated)

- ALWAYS commit before (or with) a deploy — never leave live code uncommitted. Order: finish work → gates green → `git add` + commit → `node scripts/deploy.mjs`. If you already deployed uncommitted work, commit immediately after and note it in `PLAN.md`.
- Push `main` when the user asks; the gh-pages publish alone does NOT sync source.

## Commands

- `npx tsc --noEmit` — must pass; `npx vitest run` — all tests must pass (no duplicate `it()` titles, see `scripts/precommit.mjs`).
- `node scripts/precommit.mjs` (or `npm run verify`) — tsc + catastrophic-shrink + duplicate-test-title checks. Wired as `predeploy`.
- `node scripts/deploy.mjs` — build + gh-pages publish + live sync verify (retry loop).
- `node scripts/verify-live.mjs [url]` — live chest/card e2e (playwright). `node scripts/verify-gamification.mjs [url]` — live gamification/arcade e2e.
- Playwright core import path in scripts: `createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')`.

## Gotchas

- Shell is Windows PowerShell: chain with `;`, not `&&`.
- Two of everything is NOT true here — single app, `src/` + `public/` + `tests/`.
- Card economy: `CARDS` = 97 chest-pool rows + separate `ARCADE_CARDS` (3 exclusives, `source: 'arcade'`, `ALL_CARDS`=100) — never merge arcade rows into `CARDS` (uniform pick/pity/novelty/odds all read `CARDS`). All art is `.webp` (10 legacy SVGs deleted in Phase 12).
- `cardStars` keys sync via cloudsave as-is (server accepts any sane key); counters like `arcadeRounds`/`arcadeBossesDown` are local-only (server field whitelist).
- `arcadeBests` achievement counts ANY `arcadeScores` key (incl. legacy `math-run`/`number-blaster`); Bean's unlock must count only current `ARCADE_GAMES` ids.
- MascotId includes card-only ids (`fang|bean|bark`) that are NOT in `MASCOTS` — tests typing `Record<MascotId, …>` over playable mascots must exclude them (see `tests/mascots.test.ts`).
- State persist version is in `src/engine/store.ts` (`version` + `migrate`); bump + backfill when adding fields.
