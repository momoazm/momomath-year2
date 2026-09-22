# PLAN — Subject roadmaps, per-subject arcade, Fang/Bean/Bark exclusives, pixel boss

**Status legend:** `[ ]` pending · `[x]` done · `[~]` in progress
**Research constraints (never violate):**
- Cloudsave accepts any sane `cardStars` key → new card ids sync with zero server changes. Counters stay local (server whitelists fields).
- `CARDS` pinned at 19 (`cardStars.test.ts:54`); chest odds/pity/novelty read `CARDS` → arcade cards go in SEPARATE `ARCADE_CARDS`, chest pool untouched.
- `arcadeBests` counts ANY `arcadeScores` key (incl. legacy) → Bean unlock counts only current 3 game ids.
- Library is one flat grid + tier tabs → exclusives need a genuinely separate section.

## Phase 1 — Roadmaps appear for all 3 subjects (small)
- [x] 1. Live-verify subject switching (TopBar pills 🧮📚🔬) renders units/lessons for maths/english/science at 360px — registry has all 3 (`registry.ts:11-15`). (Verified via registry + verify-gamification subject-switch check.)
- [x] 2. Delete stale "Science is coming soon!" empty state (`PathScreen.tsx:79-92`) — science has 6 real units.
- [x] 3. Fix anything the live check surfaces (likely polish only).

## Phase 2 — Arcade: one game per subject, drop 2 (medium)
- [x] 4. `ARCADE_GAMES` = Boss Rush (🧮) / Word Rescue (📚, 60s/3 lives, bank `src/content/arcadeWords.ts` ~40 entries) / Lab Blitz (🔬, 60s/3 lives, bank `src/content/arcadeScience.ts` ~40 entries). math-run + number-blaster removed from list (ids stay valid in persisted scores); `ArcadeGameDef.id` is `string`.
- [x] 5. Refactor `ArcadeGame.tsx`: per-game question source; Number Blaster fuse + Math Run −5s branches deleted. Quests/XP/gems/`addArcadeCorrect` plumbing unchanged.
- [x] 6. ArcadeScreen: subtitle "One game per subject · earn ⚡ XP and set high scores", subject badge (🧮/📚/🔬) per game card.

## Phase 3 — Exclusive cards: Fang, Bean & Bark (medium)
- [x] 7. `cards.ts`: `ARCADE_CARDS` (tier exclusive, `source: 'arcade'`, NOT merged into `CARDS`).
  - 🦊 Fang the Fox — finish 10 arcade rounds (lifetime)
  - 💣 Bean the Dynamite — set a score in all 3 subject games (current ARCADE_GAMES ids only)
  - 🐻 Bark the Polar Bear — defeat 5 bosses total in Boss Rush
- [x] 8. Art: author `public/cards/{fang,bean,bark}.svg` (240×320, gradient bg, outlined char, like `jet.svg`); `MascotId` union extended with `'fang'|'bean'|'bark'` (type-only, `MASCOTS` untouched — fix `tests/mascots.test.ts` Record<MascotId,…> to exclude card-only ids).
- [x] 9. Store: persist **v9→v10** backfill `arcadeRounds: 0`, `arcadeBossesDown: 0` (local-only); `grantArcadeCard(id)` grants 3 copies (=1★) once (dedupe if owned); `checkArcadeCards()` called from `ArcadeGame.finish()` — on grant: `sfx.streak` + celebration overlay on round-over ("🕹️ Exclusive unlocked: …"). cardStars syncs via existing cloudsave. (ArcadeGame currently calls `st.recordArcadeRound(...)` — implement it.)
- [x] 10. Library — separate "🕹️ Arcade Exclusives" panel under header (above tier tabs): own heading + `x/3 collected`, 3-card grid. Locked cards show unlock condition + LIVE progress ("Rounds 4/10", "Bosses 3/5", "Games 1/3"); unlocked open modal with obtain text "Unlocked in the Retro Arcade". Tier tabs filter main grid only. Locked click → toast with condition (not "Win from a chest").
- [x] 11. Knobs: ProfileScreen unique-cards stat (`ProfileScreen.tsx:134`) = owned/22 across both arrays.

## Phase 4 — Pixelated boss with hit/defeat animation (medium)
- [x] 12. `src/components/arcade/PixelBoss.tsx`: inline SVG pixel sprite (rect grid, crispEdges, 16×16), 3 frames idle/hurt/defeated, hue-shift variant per boss.
- [x] 13. Animations (framer-motion): idle bob; on hit shake+red flash+hurt frame ~300ms; boss lost → defeated frame → fall+fade ~600ms → next boss spawns hue-shifted. HP-hearts bar kept, sprite above question card.

## Phase 5 — Tests, verify script, ship
- [x] 14. `npx tsc --noEmit; npx vitest run` all green. New tests: `rollChest` NEVER returns arcade ids (uniform + pity paths), `grantArcadeCard` dedupe + 3-copy grant, `checkArcadeCards` thresholds; 19-card art contract untouched.
- [x] 15. Update `scripts/verify-gamification.mjs`: new game list, Boss Rush play-through (replaces Math Run), exclusive-card grant check, library arcade section visible with 3 cards + progress text, subject-switch roadmap check (english/science unit headers render), keep dust + mobile-viewport checks. Persist seed → v10. (Rewritten; 42/42 checks pass against local preview.)
- [x] 16. Commit → `node scripts/deploy.mjs` → `verify-live.mjs` + updated `verify-gamification.mjs` → report. (Commit 0455fc8; deploy VERIFIED in sync; live verify-live 12/12, verify-gamification 42/42.)

**Unlock mapping:** Fang = 10 rounds · Bean = all 3 subject games · Bark = 5 bosses.

## Phase 6 — WS5: 2D retro side-scroller "Pixel Run" (medium)
- [x] 17. `ARCADE_GAMES` += `pixel-run` (🏃, subject math, "Jump the spikes and clear math gates to the finish"); extract `makeMathQuestion` → `src/content/arcadeMath.ts` (Boss Rush reuses it); shared `finishArcadeRound` payout helper in `src/engine/arcadeRound.ts` (used by ArcadeGame + PixelRun).
- [x] 18. `src/components/arcade/PixelRun.tsx`: auto-run left→right, tap/Space jump, spike obstacles (−1 life + i-frames), coin arcs, math question gates every 800px (pause + MCQ; correct = +20 score/+30 coins, wrong = −1 life), finish flag at 6400px (+100), 60s/3 lives, pure `computeRunScore`/`gateX` helpers exported for tests; pixel SVG runner/spike/coin sprites (no assets). `ArcadeScreen` routes `pixel-run` → PixelRun; subtitle → "Retro games · earn ⚡ XP and set high scores".
- [x] 19. Bean unlock counts DISTINCT SUBJECTS among current `ARCADE_GAMES` (still goal 3 — Pixel Run shares the maths badge; label/flavor "all 3 subject games" unchanged); `verify-gamification.mjs` → 4 games + new subtitle.
- [x] 20. Tests `tests/pixelRun.test.ts` (registration, gate layout, score math, gate question shape, Bean subject-count); `npx tsc --noEmit` + `npx vitest run` (32 files / 1017 tests) + `node scripts/precommit.mjs` green; local `npm run dev` smoke 9/9 (4-game list, ready screen, stage render, jump, live score, spike hit, gate overlay, zero page errors) — no deploy.
