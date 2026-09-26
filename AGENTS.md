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

## No momolearn.space content / no-merge rule (standing, user-mandated 2026-09-25)

- NEVER take anything from the momolearn.space project (repo `momoazm/momolearn-ai`, local folders `C:\Users\momo\momolearn-ai` and `C:\Users\momo\Documents\Default Project`) into THIS repo: no code, no lesson/story/text content, no data files, no images/SVG/webp assets, no CSS, no copy strings. Zero copying, in either direction.
- NEVER merge the two projects: no `git remote add` of momolearn-ai, no cross-repo branch merges/cherry-picks/stashes, no folder sync. `origin` here is ONLY `momoazm/momomath-year2`.
- ONLY permitted exception: consuming the momolearn-ai **HTTP API as a backend service** — the URL constants in `src/engine/cloudsave.ts` / `leaderboard.ts` / `friends.ts` and their JSON wire contract. A URL + JSON payload is not content; anything beyond that (server code, page markup, styles, assets) must be re-implemented natively here.
- Before shipping work that adds a cross-project dependency, run a provenance check (does any new file match a file in the momolearn folders?) and record the result in `PLAN.md`.

## No-deletion rule (standing, user-mandated)

- NEVER delete features, pages/screens, mechanisms, or cards — not lesson content, node types, UI flows, games, mascots, endpoints, questions, or card entries. Only ADD or MODIFY.
- The ONLY exception is the user explicitly saying "delete/remove X" in chat for that specific item. Never propose deletion as a cleanup/fix/refactor step.
- "Remove from view/flow" is allowed ONLY by hiding, deprecating, or superseding — underlying code and data ids stay in the repo.
- Persisted ids (lesson ids, card ids, arcade score keys, achievement ids, mascot ids) stay valid forever so old saves keep loading.

## Commands

- `npx tsc --noEmit` — must pass; `npx vitest run` — all tests must pass (no duplicate `it()` titles, see `scripts/precommit.mjs`).
- `node scripts/precommit.mjs` (or `npm run verify`) — tsc + catastrophic-shrink + duplicate-test-title checks. Wired as `predeploy`.
- `node scripts/deploy.mjs` — build + gh-pages publish + live sync verify (retry loop).
- `node scripts/verify-live.mjs [url]` — live chest/card e2e (playwright). `node scripts/verify-gamification.mjs [url]` — live gamification/arcade e2e.
- Playwright core import path in scripts: `createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')`.

## Gotchas

- Shell is Windows PowerShell: chain with `;`, not `&&`.
- PowerShell 5.1 `Get-Content`/`Set-Content` WITHOUT explicit `-Encoding UTF8` reads/writes BOM-less UTF-8 files as ANSI and double-encodes them (this is exactly how `src/content/curriculum.ts` got its 2026-09 mojibake, and PLAN.md briefly got corrupted in-session). Never round-trip repo files through default-encoding cmdlets — use the edit/write tools, or pass `-Encoding UTF8` on BOTH read and write.
- Two of everything is NOT true here — single app, `src/` + `public/` + `tests/`.
- Card economy: `CARDS` = 97 chest-pool rows + separate `ARCADE_CARDS` (3 exclusives, `source: 'arcade'`, `ALL_CARDS`=100) — never merge arcade rows into `CARDS` (uniform pick/pity/novelty/odds all read `CARDS`). All art is `.webp` (10 legacy SVGs deleted in Phase 12).
- `cardStars` keys sync via cloudsave as-is (server accepts any sane key); counters like `arcadeRounds`/`arcadeBossesDown` are local-only (server field whitelist).
- `arcadeBests` achievement counts ANY `arcadeScores` key (incl. legacy `math-run`/`number-blaster`); Bean's unlock must count only current `ARCADE_GAMES` ids.
- MascotId includes card-only ids (`fang|bean|bark`) that are NOT in `MASCOTS` — tests typing `Record<MascotId, …>` over playable mascots must exclude them (see `tests/mascots.test.ts`).
- State persist version is in `src/engine/store.ts` (`version` + `migrate`); bump + backfill when adding fields.
