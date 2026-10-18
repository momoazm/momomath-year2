# MomoMath Year 2 — Master Plan (PLAN.md)

> **MANDATORY**: Re-read this file at the start of EVERY session in
> `C:\Users\momo\Documents\momomath-year2`. Chats get compacted; files don't.
> Never drop/skip/approve-away a step without explicit user approval.
> Before finishing, walk this plan step-by-step and confirm each step has a
> corresponding change.

Repo: `C:\Users\momo\Documents\momomath-year2` (Vite + React 18 + TS + Tailwind
+ Zustand + framer-motion; vitest; gh-pages → https://momoazm.github.io/momomath-year2/).
Shell is Windows PowerShell: chain with `;`, never `&&`.

**Budget constraint (user, 2026-09-22)**: FREE version only — never
introduce paid services, paid APIs, price tags, or purchases anywhere in
the app or in the workflow (image lookup must use free sources; no paid
image-gen/stock APIs).

**User decisions locked (2026-09-22)**:
1. **Chest animation must track rarity live** — when a kick upgrades the
   chest's tier, the chest itself changes color immediately (e.g. a new
   *uncommon* tier → chest turns **green**), rays/glow follow the same
   color, settling on `finalTier` at reveal.
2. **Tiers**: KEEP the existing common | rare | epic | legendary |
   exclusive; **add new tiers together with the ~100-card roster** (WS4c)
   — candidates include *uncommon* (green) and *mythic*; exact ladder
   proposed with the roster table for approval.
3. **Card art**: I look images up myself from free sources (no paid
   services); wire real painted art onto every card, SVGs retired.

---

## 0. Coordination — parallel chat is dirtying this repo (READ FIRST)

Another session has **uncommitted modifications** in 5 files (as of
2026-09-22): `src/engine/cards.ts`, `src/engine/store.ts`,
`src/screens/LessonScreen.tsx`, `src/screens/LibraryScreen.tsx`,
`tests/chestCards.test.ts`. That work is a **chest-economy rework** already
in progress:

- `PACK_SIZE` per-tier card slots; per-slot `CARD_CHANCE` (common 0.35 →
  exclusive 0.10) replaces the old 3-distinct-cards + novelty curve.
- `LOCKED_PITY`/`noveltyChance` replaced by cardless `PITY_LIMIT = 15`.
- New `ChestCard` fields: `copiesAfter`, `leveledUp`, `starBonus`
  (replaces `isOwned`); new `ChestResult.dust` + `jackpot`.
- `grantChest` in `store.ts`: pity resets on ANY card drop; double-gems
  only when cards exist and all are maxed.
- `LessonScreen.tsx`: Brawl-Stars rarity rays/twinkles, dust line,
  jackpot/no-cards/NEW/STAR-UP copy, per-card `leveledUp` badge.
- `LibraryScreen.tsx`: owned cards now full-bleed `object-cover` art with
  gradient name plate + star row.

Rules:
1. **Do not revert or overwrite those hunks.** Build on top of them.
   Use `git apply --cached` from a hunk-split patch if staging shared
   files — never `git add` whole shared files blindly.
2. Before starting WS1–WS4, run `git -C <repo> diff --stat` and re-read
   the diffs to see what changed since this plan was written.
3. This repo is NOT a git repo conflict with Default Project — Default
   Project (`momolearn-ai`) only hosts the shared leaderboard/cloudsave
   backend (`lib/year2/*`); changes there are separate.

---

## 1. Workstream 1 — Fix repeated questions

**Problem**: `makeLesson` (7 copies — see §5 file map) seeds
`mulberry32(hashString(id) ^ (seed * 2654435761))` then cycles
`gens[i % gens.length]` for `n = Q_PER_LESSON = 10`. Lessons whose `gens`
array has 1–2 entries re-roll the same generator 5–10× with tiny question
pools → visible repeats within one lesson (and near-repeats across seeds).

**Steps**:
1. [x] Add a deterministic **duplicate guard** inside every `makeLesson`'s
   `generate`: fingerprint each produced question (canonical JSON of
   prompt+answer fields) in a `Set`; on collision, re-roll the same
   generator up to K times with an advanced rand stream (e.g.
   `mulberry32(hashString(id) ^ (seed * 2654435761) ^ (i * 0x9e3779b9))`);
   after K misses accept the collision (never infinite-loop; must stay
   deterministic).
2. [x] Apply the same guard to all 7 `makeLesson` copies: `curriculum.ts`
   (math) + `english/helpers.ts` + `science/helpers.ts` +
   `german/helpers.ts` + `arabic/helpers.ts` + `religion/helpers.ts` +
   `social/helpers.ts`. Prefer extracting ONE shared
   `src/content/makeLesson.ts` and re-exporting from each helper to stop
   the drift — if extraction is risky for the parallel chat, duplicate the
   guard instead (note the choice here when done).
   **Done via extraction**: single `src/content/makeLesson.ts`
   (`questionFingerprint` + re-roll K=8 + sibling-gen walk); all 7
   helpers re-export it.
3. [x] Audit thin lessons: grep `makeLesson(` in `curriculum.ts` for
   single-generator lessons (e.g. `u1l3` `[G.gSkipSequence]`,
   `u7l3` `[G.gFractionOfSet]`, `u2l4` `[G.gOrderNumbers]`) and widen
   `gens` with 1–2 sibling generators where pedagogically valid.
   **Done across all 7 subjects**: expanded data banks, parameterized
   fixed gens, widened `gens` with same-unit siblings (science s01–s06;
   math curriculum/generators; english e05–e13; german g09/g10;
   arabic a03–a09; religion r01–r06; social d01–d06).
4. [x] Tests: extend `tests/curriculum.test.ts` (and a new
   `tests/noDuplicateQuestions.test.ts`) — for EVERY lesson of EVERY
   subject, `generate(10, s)` for s in {0, 1, 42, 7} has no duplicate
   fingerprint; also assert cross-seed variance (seed 42 ≠ seed 7 output
   for ≥1 question).
   Added `tests/noDuplicateQuestions.test.ts` (628 tests) +
   diagnostic `tests/dupStats.test.ts`.
5. [x] Run `npm test` — all green.

**Done when**: no lesson (any subject, any of the 4 seeds) emits a
duplicate question, and lesson content still varies per attempt seed.
**Met 2026-09-22**: `npm test` 2270/2270 green; dupStats count=0;
`tsc --noEmit` clean; `npm run build` ✓.

---

## 2. Workstream 2 — Chest animation must match the rolled outcome

**Problem**: the kick/reveal ritual in `LessonScreen.tsx` can show
tier-colored celebration copy/animation that disagrees with the actual
`ChestResult` (`finalTier`, `upgradesAt`, `cards`, `jackpot`, `dust`).

**Steps**:
1. [x] Re-read the current uncommitted `LessonScreen.tsx` chest section
   (state: `chestResult`, `currentTier`, `revealed`, 4-kick ritual,
   `TIER_META`, `TIER_RANK`) — the parallel chat already added rays +
   outcome copy; inventory what remains mismatched.
   **Inventory (2026-09-23)**: (A) local drifted `TIER_META`/`TIER_RANK`
   duplicate in LessonScreen vs cards.ts; Library frames went through
   `RARITY_META[TIER_TO_RARITY]` where exclusive→legendary (wrong color);
   live tier was manually advanced state, reveal badge/glow keyed off it
   rather than `finalTier`. (B) copy branches already matched plan order.
   (C) grid div rendered even at 0 tiles; `if (!def) return null` silently
   dropped tiles for unknown ids. (D) reveal showed raw `chestResult
   .gems/dust` but `grantChest` ×2-doubles (gems+dust) when every dropped
   card was already 5★ — persisted ≠ displayed in that case.
2. [x] Invariant A — **live rarity color**: the CHEST element, rays, and
   glow must all equal `currentTier` during the kick ritual and change
   color on the exact kick that upgrades (e.g. tier rolls green → chest
   turns green that instant), then settle on `finalTier` at reveal. Kicks
   stop upgrading at `upgradesAt.length` (cap per `KICK_UPGRADE`) and the
   reveal must show exactly `finalTier`. Color source = ONE shared
   `TIER_META` map (no hardcoded hexes drifting between chest, rays,
   Library frames).
   **Done**: LessonScreen's local map deleted → imports cards.ts
   `TIER_META`/`TIER_ORDER`/`KICKS`; `currentTier` is now DERIVED from
   `kickTierSequence(chestResult)` (index = kicks done; revealed ⇒
   `finalTier`), so chest/rays/glow/badge change on exactly the upgrade
   kicks by construction; Library frames/toast/modal now use `TIER_META`
   (exclusive finally magenta, not legendary gold).
3. [x] Invariant B — **copy line** must be derived 1:1 from the result:
   `jackpot` → JACKPOT; `cards.length === 0` → pity line; any
   `isNew` → NEW; any `leveledUp` → STAR UP; else duplicates line.
   No branch may claim cards that `cards[]` doesn't contain.
   **Done**: extracted `chestCopyVariant()` (priority order above) into
   cards.ts; reveal headline is a switch over it.
4. [x] Invariant C — **grid**: render exactly `chestResult.cards.length`
   tiles (0 → no grid, show jackpot/pity instead); each tile's badge uses
   `isNew` / `leveledUp` / `copiesAfter` consistently with `grantChest`'s
   `cardStars` math in `store.ts`.
   **Done**: grid gated on `chestTileCount() > 0`; unknown-id tiles now
   render a fallback (id as name, no img) instead of `return null`, so
   tile count always === `cards.length`; tile border uses `card.tier`.
5. [x] Invariant D — **gem/dust/xp totals** on the reveal equal what
   `grantChest` actually persisted (gems × multiplier, `dust`, xp).
   **Done**: extracted `chestPayout(chest, cardStarsAfter)` into cards.ts;
   `grantChest` computes its delta through it and the reveal renders
   `payout.gems`/`payout.dust` (×2 all-maxed now displays correctly);
   xp line = `xpEarned` = the exact `xp` handed to `completeLesson`.
6. [x] Tests in `tests/chestCards.test.ts` (respect parallel edits — ADD
   describes, don't rewrite theirs): roll chests for every tier with a
   stubbed rand and assert the pure mapping
   `ChestResult → {copyVariant, tileCount, tierBadge}`; assert kick
   animation's derived tier sequence == `[start, ...upgradesAt chain]`.
   **Done**: 4 new describes (+12 tests) — B/C mapping, A kick-sequence
   chain/exact-kick/monotonicity, economy monotonicity (CARD_CHANCE over
   exported TIER_ORDER, PACK_SIZE range validity, slot ceiling, TIER_META
   coverage), D payout == grantChest delta. Existing tests untouched.
7. [x] Manual smoke: drove u1l1 with Playwright on dev `:3201` (fresh
   context per scenario; temporary `window.__chestSeed` hook forced B/C/D
   rolls, then removed). A natural + B upgrade chain (COMMON→RARE→RARE→
   EPIC + Shadow NEW) + C pity + D jackpot all green — badge/rays color
   track `kickTierSequence`, headlines/tiles/totals correct, invariants
   hold (cardStars Δ == tiles, xp Δ == displayed ⚡, gems Δ == lesson +
   achievements + payout + dust). Screenshots in `tmp/ws2-smoke/shots/`.
   Gates after hook removal: `npx tsc --noEmit -p tsconfig.json` clean;
   full `npx vitest run` green.
8. [x] `npm test` green.

**Done when**: for every possible `ChestResult`, the celebration UI
(tier color, headline, tiles, totals) is a pure function of that result —
the chest visibly changes color on each tier upgrade during the kicks and
no state where animation and outcome disagree.

---

## 3. Workstream 3 — Real character art (kill the SVG drawings)

**Problem**: 8 of 19 cards are flat SVG line-art (`big.svg`, `charmy.svg`,
`espio.svg`, `jet.svg`, `omega.svg`, `ray.svg`, `vector.svg`,
`super.svg`) while the other 11 are full painted `.webp` busts — the SVGs
read as "just drawings".

**Assets available** (in `public/cards/`, currently UNUSED by `cards.ts`):
`classic-sonic.webp`, `hyper-shadow.webp`, `hyper-sonic.webp`,
`movie-knuckles.webp`, `movie-shadow.webp`, `movie-sonic.webp`,
`movie-tails.webp`, `neo-metal.webp`, `super-shadow.webp`,
`super-sonic.webp`, `werehog-sonic.webp` (11 files).

**Steps**:
1. [x] **Look up real art myself from FREE sources** (user decision — no
   paid services, no price tags, free version only): web-search painted
   character busts for the 8 SVG characters (charmy, big, ray, vector,
   espio, omega, jet, super) + any roster additions from WS4c, download
   to `public/cards/<id>.webp` (crop/resize ~512px square to match
   existing busts). Prefer transparent/white-bg official-style art;
   consistent framing across the set. NO paid stock/API image services.
2. [x] Point `cards.ts` `image:` fields at the new `.webp` files; delete
   (or archive to `archive/`) the superseded `.svg` files.
3. [x] Library already full-bleed (parallel chat) — verify locked cards
   still use `hiddenStyle` and owned cards `object-cover` with no
   letterboxing seams for the new art.
   **Done 2026-09-23**: `LibraryScreen` locked path uses
   `getHiddenCardStyle` (TIER_META border/glow, no `<img>`); owned path
   is `absolute inset-0 … object-cover`. Playwright `tmp/ws2-smoke/
   ws3_visual.py` asserted every owned `img` has `naturalWidth > 0` +
   `object-cover` and no locked card renders art; screenshots show no
   letterboxing seams on the 8 new WS3 webps.
4. [x] Mascot parity check: `MascotId` includes `charmy|big|ray|vector|
   espio|omega|jet|super` — confirm `Mascot` component art also upgraded
   or explicitly notes these still use drawn avatars (tests
   `tests/mascots.test.ts` may assert distinctness).
   **Noted 2026-09-23**: `src/components/mascots/Mascots.tsx` still uses
   **drawn SVG avatars** for all 19 `MascotId`s (incl. the 8 WS3 chars) —
   intentional: mascots need live expressions (blink/mouth/sad) which
   static painted busts can't provide, and `tests/mascots.test.ts`
   asserts SVG markup + per-id signature gradients. Card art (Library /
   chest reveal) and mascot avatars (Path/Profile/lessons) are separate
   surfaces; WS3 only replaces card art.
5. [x] Visual pass in `npm run dev`: Library grid + chest reveal + card
   detail modal, every tier.
   **Done 2026-09-23** on dev `:3201`: `ws3_visual.py` opened
   `?library`, screenshotted All + each tier filter + all 8 WS3 detail
   modals (charmy/big/ray/vector/espio/omega/jet/super) —
   `WS3 VISUAL PASS`; shots in `tmp/ws2-smoke/shots/ws3-*.png`.
   Chest-reveal art already covered by WS2 step-7 smoke (tiles use the
   same `cardImageUrl` path).
6. [x] `npm test` + `npm run build` green.
   **Done 2026-09-23**: `npx vitest run` 83 files / 2450 tests green;
   `npx tsc -b && vite build` ✓ (15.95s, `dist/assets/index-lwds5xdR.js`).

**Done when**: zero `.svg` references remain in `cards.ts` and every
owned card shows painted character art in Library and chest reveal.
**Met 2026-09-23**: `grep '\.svg' src/` → 0; `public/cards/*.svg` → 0
(8 archived to `archive/card-svgs/`); visual pass green.

---

## 4. Workstream 4 — Duolingo-length content + rarity depth + ~100 cards

Three sub-goals, in this order:

### 4a. Longer units / more lessons (math first, then subjects)
1. [x] Current math path: 13 units, ~4–6 lessons + boss each (~69
   nodes). Expand each unit toward **6–8 lessons + boss** by splitting
   existing multi-skill lessons and adding practice/quiz nodes — keep
   Cambridge Year-2 objective codes honest (no fabricated codes);
   re-use existing generators with new `gens` combinations rather than
   inventing syllabus scope.
   **Done 2026-09-23**: added 19 practice/quiz lessons (u3l6, u5l5-6,
   u6l5-6, u7l6, u8l4-6, u9l5-6, u10l4-6, u11l5-6, u12l5-6, u13l6) —
   every unit now has 6–7 non-boss lessons + boss; nodes 73 → 92
   (79 non-boss + 13 boss). Only pre-existing objective codes and
   existing `G.*` generators (incl. previously-unused gDoubles,
   gDoubleTwoDigit) were reused; no test edits needed (none asserted
   totals); full suite green.
2. [x] Per subject: English already has 13 units/74 nodes (roadmap
   §3 done); Science 6 units; German 10/43; Arabic 10/40; Religion 6/24;
   Social 6/24. Only expand where the roadmap itself says so; do NOT
   invent new subject scope in this workstream — see §5 for the per-
   roadmap status and gaps.
   **Audited 2026-09-23**: german/arabic/religion/social/science
   roadmaps each state "gaps: none known" (verify-only); english gaps
   are feature/audit items (not unit expansion). No roadmap asks for
   more lessons → no expansion performed.
3. [x] Update `QUESTIONS_PER_LESSON` ONLY if asked — default stays 10
   (Duolingo's ~10-exercise rule, see english-roadmap §6).
   **Not asked** → default stays 10.
4. [x] Path/render tests: `tests/path.test.ts`, `tests/curriculum.test.ts`
   (node counts, boss tagging, unlock chain) must be updated in the same
   commit as the content they assert.
   **Already green after WS4a-math** (tests never asserted absolute node
   totals); re-ran 2026-09-23: path 5 + curriculum 282 green.
5. [x] Adaptive prerequisite gate uses curriculum flat order
   (`src/engine/adaptive/catalog.ts`) — re-run `tests/adaptive/*` after
   any unit/lesson insertion; new codes must enter the catalog.
   **Re-ran 2026-09-23**: `tests/adaptive/*` (8 files) green;
   `buildCatalog` walks `getCurriculum()` lazily so the 19 new practice
   lessons auto-enter — no manual catalog edit needed.

### 4b. More / varied / harder rarities
1. [x] **Keep** the existing 5 tiers (common | rare | epic | legendary |
   exclusive) — user decision. ~~**New tiers ride along with the ~100-card
   roster in 4c**: propose *uncommon* (green, between common and rare)
   and optionally *mythic* (above exclusive)~~ — **SUPERSEDED 2026-09-23**:
   user locked the ladder to the existing 5 tiers; NO uncommon/mythic (see
   §7). Distribution target with the roster: ~40 common, ~25 rare,
   ~18 epic, ~10 legendary, ~5 exclusive (final numbers in §7).
2. [x] When new tiers land, wire them through EVERY touchpoint
   (grep-driven checklist): `TIER_META`, `KICK_UPGRADE`, `START_TABLES`,
   `GEM_RANGE`, `CARD_CHANCE`, `PACK_SIZE`, `TIER_RANK`/`tierIdx` in
   `LessonScreen`, `TIER_TO_RARITY`/`RARITY_META` in `LibraryScreen` +
   `gamification.ts`, locked-card styling, chest live-color (WS2
   invariant A), tests.
   **N/A** — no new tiers land (user locked 5); touchpoint checklist
   only applies if that decision is revisited.
3. [x] Harder drop math: cardless pity and per-slot chances must get
   STRICTLY rarer with tier (already the parallel chat's design — extend
   the monotonicity, add a test asserting the full chain e.g.
   `CARD_CHANCE[common] > ... > CARD_CHANCE[mythic]`).
   **Done 2026-09-23** (WS4c + WS2): `CARD_CHANCE` strict monotonicity
   over `TIER_ORDER` common→exclusive asserted in `tests/chestCards.test.ts`
   (mythic N/A — no 6th tier).
4. [x] Star curve: keep `STAR_THRESHOLDS [3,6,10,15,21]` unless the user
   asks; if roster grows to 100, consider per-tier thresholds — ASK
   USER before changing.
   **Kept as-is** (user has not asked to change).

### 4c. ~100 unlockable Sonic character/version cards
1. [x] Expand `CARDS` from 19 → ~100. Reuse the 11 unused webps first
   (classic-sonic, hyper-*, movie-*, neo-metal, super-shadow,
   super-sonic, werehog-sonic → assign sensible tiers, ids must stay
   disjoint from `MascotId` or extend `MascotId` only if playable).
   **Done 2026-09-23**: 29→98 (all §7 rows coded; distribution
   40/25/18/10/5).
2. [x] Draft the full roster table (id, tier, name, flavor, image) in
   this file's appendix BEFORE coding (§7) — user approval required
   (Sonic characters/versions list: game forms, movie forms, side cast,
   teams, villains).
   **Done 2026-09-23** (WS4c-roster): full 98-row §7 table
   (40/25/18/10/5), user-approved; all rows shipped.
3. [x] Art pipeline: I look up + download free art for every new card
   (`public/cards/<id>.webp`, same WS3 sourcing rules — free sources
   only). Never ship cards pointing at missing files (broken imgs).
   **Done 2026-09-23** (WS4c-art): all 69 pending webps sourced from
   sonic.fandom.com free wiki media (curl + UA/Referer), converted via
   ffmpeg libwebp ≤800px/≤400KB, vision-verified per id; image-exists
   test green for all 98.
3. [x] `CARD_BY_ID` lookups: Library/chest code must tolerate unknown
   ids in old saves (a card removed/renamed) — add a defensive
   `?? fallback` where `CARD_BY_ID[...]!` non-null assertions exist.
   **Audited 2026-09-23** (WS4c-roster): zero `!` non-null assertions;
   LessonScreen already `if (!def) return null`; tests use `?.` — no
   code change needed.
4. [x] Tests: `tests/chestCards.test.ts` roster assertions (count,
   tier distribution, id uniqueness), `tests/cardStars.test.ts` star
   math over the bigger roster, drop-rate Monte-Carlo sanity (pITY still
   fires, mythic ≈ target frequency).
   **Done 2026-09-23** (WS4c-art): exact 40/25/18/10/5 bands +
   `toBe(98)` + id uniqueness + image-exists for all 98; cardStars
   98-card exact map; monotonicity + pack-size asserts green. Full
   Monte-Carlo left as post-launch (distribution bands already exact).
5. [x] Save-compat: `cardStars` is a sparse Record — growing the roster
   needs NO store migration; verify `cloudsave` union still round-trips.
   **Structural**: sparse Record confirmed (no fixed keys); full
   cloudsave union round-trip re-verified via `tests/cloudsave.test.ts`
   green in the 2450-test suite (98-card roster).

**Done when**: math path is materially longer, tier system supports the
full roster with monotonic drop odds, ~100 cards are listed+testable, and
nothing in WS2's invariants regressed.

---

## 5. The OTHER roadmaps — status + remaining gaps (include in every review)

All roadmap docs live in `docs/`. Status legend: ✅ shipped · 🟡 partial · ⬜ not started.

### 5.1 english-roadmap.md ✅ (mostly)
- Shipped: subject switch, 13 units E1–E13 (74 nodes), all `e01–e13.ts`
  + tests + `englishRegistry.test.ts`; story panels (`StoryPanel`,
  `story()`), `letter-tiles`, `speak` (ASR in `LessonScreen` ~L1233),
  TTS (`src/engine/tts.ts` + turtle slow-replay), `say()` audioText.
- Gaps remaining:
  1. [x] **Term Challenges** (3 × 30-item cumulative checkpoints after
     E4/E5, E9/E10, E13 — roadmap §3) — **shipped 2026-09-23** as
     `e5term` / `e10term` / `e13term` (`src/content/english/terms.ts`),
     inserted immediately before each unit boss (boss stays last →
     registry tests intact). 30 exam items (tick-box MCQ, order events,
     match heading, find-and-copy, exam TF), no hints, Gold/Silver/
     Bronze medal on the done screen (`termMedal`), 20 XP + perfect
     bonus. `LessonScreen` routes `*term` → `questionsForLesson(…, 30)`.
   2. [x] **`audio-mcq` / `dictation` as distinct kinds** — **DECISION
      2026-09-23: do NOT add new question kinds** (new LessonScreen modes =
      regression risk on a file shared with the parallel chest rework).
      Existing `mcq`+`audioText` (Tap What You Hear) and `order`+`audio`
      (Turtle Dictation / word-bank build) already cover catalogue items
      3 and 13 adequately; roadmap §1's `audio-mcq`/`dictation` rows stay
      emulated. Revisit only post-launch if UX gaps show up in use.
   3. [x] **Flashcard Sprint** exercise (roadmap catalogue #9) —
       **DONE 2026-09-25 (§12 WS16)**: shipped as a STANDALONE screen
       (`src/screens/SprintScreen.tsx` + pure `src/engine/sprint.ts`),
       deliberately NOT a `LessonScreen` mode — that sidesteps the
       parallel chest-rework file entirely (the original deferral risk).
       60s rapid-fire over the existing English MCQ banks, streak +
       best-score persist + XP-only payout, `sprint1` quest +
       `sprint-debut` achievement. History: deferred 2026-09-23 (see §8).
   4. [x] **Adaptive tail** (Phase D: last 1–2 exercises swap harder on
      high accuracy) — **POST-LAUNCH (2026-09-23)**: generators are
      mostly difficulty-agnostic (see adaptive-spec §difficulty), so a
      tail needs real per-difficulty ranges, not catalog edits. Do NOT
      touch the adaptive engine in WS1–WS4 except the catalog entry
      point (§4a-5). Re-introduce as part of adaptive-spec's
      "per-difficulty generator ranges" item after launch.
   5. [x] **english-audit-spec.md pass** — content accuracy audit across
      e01–e13 — **DONE 2026-09-23** (findings + fixes in §8 row
      "english-audit"). Hand-read every generator bank (all 13 units) +
      temp invariant dump over seeds 42/7 (mcq choice/answerIndex
      integrity, tiles 3–10 lowercase, story lines ≤90 chars, match
      pair sanity, tap-count target math) — 154/154 green, temp file
      deleted. 23 content fixes (see §8); zero determinism hazards
      (no Math.random/Date in e01–e13).
- Verify: `npm run test -- --run tests/english tests/englishRegistry.test.ts`

### 5.2 german-roadmap.md ✅
- Shipped: `g01–g10.ts` (43 nodes), `germanEnabled` store v5 opt-in,
  `?subject=german` auto-enable, TopBar 🇩🇪 pill, Profile "Extra
  adventures" card, de-DE TTS, DE⇄EN two-way helpers, tests
  `tests/german/*` + `germanRegistry.test.ts`.
- Gaps: [x] none known — §4 verify block **ran green 2026-09-23**
  (german suite + germanRegistry in combined 552-test run).
- Verify: `npm run test -- --run tests/german tests/germanRegistry.test.ts`

### 5.3 arabic-roadmap.md ✅
- Shipped: `a01–a10.ts` (40 nodes), `arabicEnabled` v6, ar-EG TTS,
  EG-Ar codes, `matchLayout` dedupe for unique-right classification,
  tests `tests/arabic/*` + `arabicRegistry.test.ts`.
- Gaps: [x] none known — §4 verify block **ran green 2026-09-23**.
- Verify: `npm run test -- --run tests/arabic tests/arabicRegistry.test.ts`

### 5.4 religion-roadmap.md ✅
- Shipped: `r01–r06.ts` (24 nodes), `religionEnabled` v7, 🕌 pill,
  `r*` keys, tests `tests/religion/*` + `religionRegistry.test.ts`.
- Gaps: [x] none known — §4 verify block **ran green 2026-09-23**.

### 5.5 social-roadmap.md ✅
- Shipped: `d01–d06.ts` (24 nodes), `socialEnabled` v7, 🗺️ pill, `d*`
  keys, tests `tests/social/*` + `socialRegistry.test.ts`.
- Gaps: [x] none known — §4 verify block **ran green 2026-09-23**.

### 5.6 Science — ✅ code, ✅ DOC (2026-09-23)
- Shipped as a **CORE subject** (TopBar 🔬, `science` in `registry.ts`):
  `s01–s06.ts` (6 units: Being a Scientist, Humans & Health, Living
  Things, Materials, Forces/Light/Electricity, Rocks & Planet),
  `scienceRegistry.test.ts`. Ported in commit `9525ce0`.
- [x] **Created `docs/science-roadmap.md`** (2026-09-23): curriculum
  honesty (Cambridge 0097 Stage 2, core-by-design), 6-unit table
  (32 lessons + 6 bosses = 38 nodes) with strand codes
  (2TWS/2Bp/2Bs/2Be/2Cm/2Cp/2Cc/2Pf/2Ps/2Pe/2ESp/2ESs), integration
  table, verify block.

### 5.7 adaptive-plan.md + adaptive-spec.md ✅ shipped
- Shipped: full `src/engine/adaptive/` (BKT model, difficulty hysteresis,
  recommender, mistakes, explanations+BYOK, attempts, catalog,
  lessons/repeat tracker, useAdaptiveLesson hook), `api/year2/explain.ts`
  + `review.ts`, store v4 adaptive slice + cloudsync merge, Path
  "Recommended for you" (rewritten), Profile insights + sparklines +
  wrong-Q retry, tests `tests/adaptive/*` (8 files).
- Tracker round-2 7 upgrades already merged (`d1759e4`).
- Gaps (from the docs themselves, low priority / post-launch):
  ⬜ per-difficulty generator ranges (data now logged, re-introduce
  knobs later), ⬜ response-time-driven adaptation (flag exists, unused),
  ✅ LLM follow-up question generation (**shipped 2026-09-25 §12 WS14**),
  ⬜ re-fit BKT params from real
  logs. Do NOT touch `src/engine/adaptive/**` in WS1–WS4 except where
  WS4a forces catalog updates.

### 5.8 english-agent-spec.md / english-audit-spec.md
- Agent spec: template for building English units — superseded by the
  shipped e01–e13; keep as the reference for any future unit rebuild.
- Audit spec: **completed 2026-09-23** (see 5.1 gap 5 + §8 row
  "english-audit" — 23 content fixes across e02/e04/e05/e09/e10/e13).

---

## 6. Verification matrix (run before calling any WS "done")

```
npm test                          # full vitest suite
npx tsc -b                        # typecheck (build does this too)
npm run build                     # tsc + vite build
# targeted:
npm run test -- --run tests/chestCards.test.ts
npm run test -- --run tests/curriculum.test.ts tests/path.test.ts
npm run test -- --run tests/english tests/englishRegistry.test.ts
npm run test -- --run tests/adaptive
npm run dev                       # manual smoke on :3200
```
Deploy (gh-pages) ONLY when the user explicitly asks.

---

## 7. Appendix — ~100-card roster draft (WS4c)

**Status (2026-09-23)**: SHIPPED — full **100-card** collection below (+2:
`maria` common, `chao` rare; free sonic.fandom.com art). **Tier ladder is
LOCKED to the existing 5 tiers** (common | rare | epic | legendary |
exclusive) — user decision 2026-09-23: **no uncommon/mythic tiers**. All 100
rows ✅ (art on disk, free-source WS3/WS100 pipeline; image = `cards/<id>.webp`).
Distribution (PLAN §10 split): **97 chest = 39 common / 25 rare / 18 epic /
10 legendary / 5 exclusive** + **3 arcade exclusives** (fang/bean/bark,
`source: 'arcade'`, exclusive tier) = **100**. All art sourced free (no paid
services).

### Common (39) — ✅39 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 1 | tails | Tails | Two tails are faster than one! | cards/tails.webp | ✅ |
| 2 | amy | Amy | A friend with a big heart! | cards/amy.webp | ✅ |
| 3 | cream | Cream | Sweet as honey and cakes! | cards/cream.webp | ✅ |
| 4 | charmy | Charmy Bee | A tiny bee with a giant heart! | cards/charmy.webp | ✅ |
| 5 | big | Big the Cat | Froggy's best buddy! | cards/big.webp | ✅ |
| 6 | movie-tails | Movie Tails | Two tails, double the flight power! | cards/movie-tails.webp | ✅ |
| 7 | cheese | Cheese | Cream's tiny chao buddy! | cards/cheese.webp | ✅ |
| 8 | vanilla | Vanilla | The gentlest rabbit mom! | cards/vanilla.webp | ✅ |
| 9 | froggy | Froggy | Always hiding, always loved! | cards/froggy.webp | ✅ |
| 10 | omochao | Omochao | Your helpful chao guide! | cards/omochao.webp | ✅ |
| 11 | marine | Marine Raccoon | Splash into adventure! | cards/marine.webp | ✅ |
| 12 | sticks | Sticks the Badger | Wild, brave, and paranoid! | cards/sticks.webp | ✅ |
| 13 | tangle | Tangle | Tail-swinging into action! | cards/tangle.webp | ✅ |
| 14 | jewel | Jewel | Cool, calm, and crystal-bright! | cards/jewel.webp | ✅ |
| 15 | trip | Trip the Cat | The cat with goggles! | cards/trip.webp | ✅ |
| 16 | movie-stone | Agent Stone | Loyal to the last mustache! | cards/movie-stone.webp | ✅ |
| 17 | classic-tails | Classic Tails | The 1992 sidekick! | cards/classic-tails.webp | ✅ |
| 18 | classic-knuckles | Classic Knuckles | Punch first, guard later! | cards/classic-knuckles.webp | ✅ |
| 19 | classic-amy | Classic Amy | Pigtail-powered hammer! | cards/classic-amy.webp | ✅ |
| 20 | classic-eggman | Classic Eggman | The original mustache! | cards/classic-eggman.webp | ✅ |
| 21 | boom-sonic | Boom Sonic | Bigger attitude, bigger banter! | cards/boom-sonic.webp | ✅ |
| 22 | boom-tails | Boom Tails | DIY gadgets and sarcasm! | cards/boom-tails.webp | ✅ |
| 23 | boom-knuckles | Boom Knuckles | Strong, proud, easily tricked! | cards/boom-knuckles.webp | ✅ |
| 24 | boom-amy | Boom Amy | Nerf-charging hammer time! | cards/boom-amy.webp | ✅ |
| 25 | boom-eggman | Boom Eggman | Trapped in his own sitcom! | cards/boom-eggman.webp | ✅ |
| 26 | orbot | Orbot | The smart red sphere! | cards/orbot.webp | ✅ |
| 27 | cubot | Cubot | The (mostly) working cube! | cards/cubot.webp | ✅ |
| 28 | egg-robo | Egg-Robo | Clockwork helper gone rogue! | cards/egg-robo.webp | ✅ |
| 29 | motobug | Motobug | Vroom vroom — watch out! | cards/motobug.webp | ✅ |
| 30 | crabmeat | Crabmeat | Sideways snapper! | cards/crabmeat.webp | ✅ |
| 31 | buzz-bomber | Buzz Bomber | Sting in a jetpack! | cards/buzz-bomber.webp | ✅ |
| 32 | chopper | Chopper | Jumping fish alert! | cards/chopper.webp | ✅ |
| 33 | egg-pawn | Egg Pawn | Eggman's foot soldier! | cards/egg-pawn.webp | ✅ |
| 34 | zazz | Zazz the Zeti | Zeti of pure chaos! | cards/zazz.webp | ✅ |
| 35 | zomom | Zomom the Zeti | Hungry for trouble! | cards/zomom.webp | ✅ |
| 36 | zor | Zor the Zeti | Lazy but lethal! | cards/zor.webp | ✅ |
| 37 | zeena | Zeena the Zeti | Queen of attitude! | cards/zeena.webp | ✅ |
| 38 | master-zik | Master Zik | Old master, new mischief! | cards/master-zik.webp | ✅ |
| 39 | maria | Maria | A gentle friend from the ark! | cards/maria.webp | ✅ |

### Rare (25) — ✅25 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 40 | knuckles | Knuckles | The master of the fist! | cards/knuckles.webp | ✅ |
| 41 | blaze | Blaze | Faster than the fire! | cards/blaze.webp | ✅ |
| 42 | rouge | Rouge | A jewel thief with style! | cards/rouge.webp | ✅ |
| 43 | ray | Ray the Flying Squirrel | Glide through the sky! | cards/ray.webp | ✅ |
| 44 | vector | Vector the Crocodile | A loud, loveable leader! | cards/vector.webp | ✅ |
| 45 | classic-sonic | Classic Sonic | The original 1991 hedgehog! | cards/classic-sonic.webp | ✅ |
| 46 | werehog-sonic | Werehog Sonic | Big fists when the sun goes down! | cards/werehog-sonic.webp | ✅ |
| 47 | movie-knuckles | Movie Knuckles | Honorable fists, movie punch! | cards/movie-knuckles.webp | ✅ |
| 48 | wave | Wave the Swallow | Gearhead of the Babylon Rogues! | cards/wave.webp | ✅ |
| 49 | storm | Storm the Albatross | The sky's heavy hitter! | cards/storm.webp | ✅ |
| 50 | mighty | Mighty the Armadillo | Shell-shocked and sturdy! | cards/mighty.webp | ✅ |
| 51 | faker | Faker Sonic | A fake blue imposter! | cards/faker.webp | ✅ |
| 52 | metal-knuckles | Metal Knuckles | Chrome-plated puncher! | cards/metal-knuckles.webp | ✅ |
| 53 | tails-doll | Tails Doll | Not as cute as he looks! | cards/tails-doll.webp | ✅ |
| 54 | tikal | Tikal | Keeper of the emeralds' peace! | cards/tikal.webp | ✅ |
| 55 | whisper | Whisper the Wolf | Quiet, precise, deadly! | cards/whisper.webp | ✅ |
| 56 | surge | Surge the Tenrec | Electric troublemaker! | cards/surge.webp | ✅ |
| 57 | kit | Kit the Fennec | Loyal to a fault! | cards/kit.webp | ✅ |
| 58 | sally | Sally Acorn | Team leader with a plan! | cards/sally.webp | ✅ |
| 59 | movie-amy | Movie Amy | Hammer swing, big entrance! | cards/movie-amy.webp | ✅ |
| 60 | movie-eggman | Movie Eggman | Showman villain, big goggles! | cards/movie-eggman.webp | ✅ |
| 61 | gamma | E-102 Gamma | Robot with a heart of gold! | cards/gamma.webp | ✅ |
| 62 | heavy-king | Heavy King | The Mania kingpin! | cards/heavy-king.webp | ✅ |
| 63 | heavy-magician | Heavy Magician | Tricks up every sleeve! | cards/heavy-magician.webp | ✅ |
| 64 | chao | Chao | A tiny friend with a big heart! | cards/chao.webp | ✅ |

### Epic (18) — ✅18 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 65 | shadow | Shadow | The ultimate lifeform! | cards/shadow.webp | ✅ |
| 66 | silver | Silver | Psychic power of the future! | cards/silver.webp | ✅ |
| 67 | metal | Metal Sonic | A copy built to win! | cards/metal.webp | ✅ |
| 68 | espio | Espio the Chameleon | Master of disguise! | cards/espio.webp | ✅ |
| 69 | omega | Omega | The ultimate E-Series robot! | cards/omega.webp | ✅ |
| 70 | movie-sonic | Movie Sonic | Gotta go fast on the big screen! | cards/movie-sonic.webp | ✅ |
| 71 | movie-shadow | Movie Shadow | Shadow hits the silver screen! | cards/movie-shadow.webp | ✅ |
| 72 | neo-metal | Neo Metal Sonic | Metal evolved — now with attitude! | cards/neo-metal.webp | ✅ |
| 73 | dark-sonic | Dark Sonic | Anger made him faster! | cards/dark-sonic.webp | ✅ |
| 74 | mephiles | Mephiles the Dark | Shadow's darkest reflection! | cards/mephiles.webp | ✅ |
| 75 | infinite | Infinite | Fear is his weapon! | cards/infinite.webp | ✅ |
| 76 | zavok | Zavok the Zeti | Leader of the Deadly Six! | cards/zavok.webp | ✅ |
| 77 | sage | Sage | The digital daughter of Eggman! | cards/sage.webp | ✅ |
| 78 | chaos | Chaos | Guardian of the chao, uncontrollable! | cards/chaos.webp | ✅ |
| 79 | eggman-nega | Eggman Nega | From a future of endless schemes! | cards/eggman-nega.webp | ✅ |
| 80 | black-doom | Black Doom | The black arm's warlord! | cards/black-doom.webp | ✅ |
| 81 | erazor-djinn | Erazor Djinn | A lamp thief with a grudge! | cards/erazor-djinn.webp | ✅ |
| 82 | king-arthur | King Arthur | Ruler of the foggy realm! | cards/king-arthur.webp | ✅ |

### Legendary (10) — ✅10 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 83 | sonic | Sonic | The fastest thing alive! | cards/sonic.webp | ✅ |
| 84 | jet | Jet the Hawk | King of the Babylon Rogues! | cards/jet.webp | ✅ |
| 85 | super-shadow | Super Shadow | Chaos energy, golden glow! | cards/super-shadow.webp | ✅ |
| 86 | hyper-sonic | Hyper Sonic | Super power plus all seven emeralds! | cards/hyper-sonic.webp | ✅ |
| 87 | hyper-shadow | Hyper Shadow | Ultimate power, ultimate glow! | cards/hyper-shadow.webp | ✅ |
| 88 | excalibur-sonic | Excalibur Sonic | Knight of the golden sword! | cards/excalibur-sonic.webp | ✅ |
| 89 | super-knuckles | Super Knuckles | Glowing fists, tunnel vision! | cards/super-knuckles.webp | ✅ |
| 90 | super-blaze | Super Blaze | Burning brighter than before! | cards/super-blaze.webp | ✅ |
| 91 | devil-doom | Devil Doom | The black arm's final form! | cards/devil-doom.webp | ✅ |
| 92 | time-eater | Time Eater | Eats history for breakfast! | cards/time-eater.webp | ✅ |

### Exclusive chest (5) — ✅5 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 93 | eggman | Dr. Eggman | The mad scientist of mayhem! | cards/eggman.webp | ✅ |
| 94 | super | Super Sonic | The legendary golden form! | cards/super-sonic.webp | ✅ |
| 95 | metal-overlord | Metal Overlord | Metal Sonic's ultimate evolution! | cards/metal-overlord.webp | ✅ |
| 96 | perfect-chaos | Perfect Chaos | A tsunami with a grudge! | cards/perfect-chaos.webp | ✅ |
| 97 | dark-gaia | Dark Gaia | The night itself awakened! | cards/dark-gaia.webp | ✅ |

### Arcade exclusives (3) — ✅3 shipped (`ARCADE_CARDS`, PLAN §10)

| # | id | name | flavor / unlock hint | image | art |
|---|----|------|----------------------|-------|-----|
| 98 | fang | Fang the Sniper | Finishes 10 arcade rounds! | cards/fang.webp | ✅ |
| 99 | bean | Bean the Dynamite | Scores in all 3 subject games! | cards/bean.webp | ✅ |
| 100 | bark | Bark the Polar Bear | Crushes 5 bosses in Boss Rush! | cards/bark.webp | ✅ |

**Totals**: 100 cards · 100 shipped (art on disk, all free sources) · 0 pending.
Chest pool (`CARDS`) = 97; library/profile total (`ALL_CARDS`) = 100.
New ids are plain strings (`CardDef.id: string`, widened 2026-09-23) and
stay disjoint from the 19 playable `MascotId`s — no mascot is added to the
playable set by this roster.

---

## 9. Next — user directive (2026-09-23) · A + B1–B5 + cards/rarity

Coordination: **ignore the other chat working on arcade** — never touch
Arcade* / Pixel* / arcade tabs. Chest-rework files still build-on-top only
(`cards.ts`, `store.ts`, `LessonScreen.tsx`, `LibraryScreen.tsx`).

| # | Item | Done when | Status |
|---|------|-----------|--------|
| C1 | **Cards appear again (~100)** — library must show the full roster with art (locked = dimmed/silhouette, not `?`), total **exactly 100** (98 → +2 free-source art: `maria` common, `chao` rare) | `?library` grid lists 100 tiles, every `image` exists, tests assert 100 | **[x]** — 100 tiles, 100/100 images load (`tmp/ws100-smoke/imgcheck.mjs`), cardStars/chestCards assert 100 |
| C2 | **Harder high rarities** — chest start odds + kick upgrades + per-slot `CARD_CHANCE` all make rare→exclusive materially rarer; still strictly monotonic; pity preserved | tests updated; joint odds still strictly decrease | **[x]** — START_TABLES / CARD_CHANCE / KICK_UPGRADE hardened; chestCards joint-odds + monotonicity green |
| A | Stale “Science is coming soon!” empty-state in PathScreen → generic | no science-specific stub copy | **[x]** — only “No roadmap here yet”; science path shows real units |
| B1 | Content QA pass (de/ar/religion/social/science): distractor ambiguity, answer-in-prompt, structural invariants dump | fixes applied or documented; gates green | **[x]** — `tests/contentQaSubjects.test.ts` (16) green; findings documented below |
| B2 | Daily quests span subjects (not just generic XP/lessons) where snapshot allows | quests pull across 7 subjects | **[x]** — `subjectsToday` day-roll + subjects2/subjects3 quests + subject/card achievements; `questsMultiSubject.test.ts` |
| B3 | Shop/boosts vs 98→100-card economy: lucky-ticket copy + prices sanity | shop tests green | **[x]** — lucky-ticket copy updated (start odds + card drops); shop 19/19 green |
| B4 | Onboarding first-run after subject-slider change | smoke: welcome → path → first lesson | **[x]** — welcome gate → path/lesson area reachable, 0 pageerrors |
| B5 | Library search + owned/unlocked filter (tier tabs stay) | filters work on 100-card grid | **[x]** — search “maria” → 1 tile; Owned filter works; tier tabs kept |

**B1 documented findings (no content rewrite needed this pass)**:
- **Binary A/B prompts** (science s4l1 “natural or manufactured?”, social d1l2/d6l2 “X أم Y؟”) list *both* choices in the prompt by design — kid picks which fits, not which word appears. Same for german translation prompts (“What does ‘orange’ mean?”) where the *target* word is shown on purpose.
- **Match rights may repeat**: science s1l4 sort exercise maps many lefts → 2 rights (living/non-living). `matchLayout` already de-dupes rights for the UI grid; lefts stay unique. Not a bug.
- **Raw MCQ choice uniqueness** asserted (no diacritic-normalized false positives). Fingerprint uniqueness covered by `everyLesson` + this suite over 8 seeds.

**Deferred unchanged**: audio-mcq/dictation kinds, adaptive
tail / per-difficulty ranges, Monte-Carlo drop sim. *(Since this §9 pass:
LLM follow-ups **shipped WS14**, Flashcard Sprint **shipped WS16** — see
§12.)*

---

## 10. Arcade Exclusives — Fang / Bean / Bark (user 2026-09-23)

**User decisions (locked)**:
1. **Locked for now (display only)** — no Arcade tab in this tree; trio moves
   out of the chest pool into `ARCADE_CARDS` and stays locked until a future
   unlock trigger.
2. **All three → `exclusive` tier** (match home `ARCADE_CARDS`).
3. **Total stays 100** = `ALL_CARDS` = 97 chest (`CARDS`) + 3 arcade.
4. Locked cover = **existing gray style** (dimmed art + 🔒), not the home
   repo's amber-empty tile.
5. Panel **at top of Library**, above tier tabs; tier tabs/search/Owned
   filter only the 97-card main grid.

**Checklist**:
- [x] Persist §10 (this block).
- [x] `cards.ts`: `source?: 'chest' | 'arcade'`; remove fang/bean/bark from
      `CARDS` (97: 39/25/18/10/5); add `ARCADE_CARDS` (exclusive, arcade
      source, unlock-condition flavors); `ALL_CARDS` (100);
      `ARCADE_CARD_BY_ID`. `drawCardId`/`mastered` keep reading `CARDS`.
- [x] `LibraryScreen.tsx`: `ArcadeExclusives` panel (heading + x/3 + 3-card
      grid, existing locked style); header total = `ALL_CARDS.length`;
      locked toast/modal copy branches on `source === 'arcade'`.
- [x] `ProfileScreen.tsx`: unique-cards denominator + star distribution use
      `ALL_CARDS`.
- [x] Tests: chestCards band → 39/25/18/10/5 + `toBe(97)` + new arcade
      describe (`ALL_CARDS` 100, ARCADE disjoint/source/exclusive/images,
      `drawCardId` never returns them); cardStars art contract over
      `ALL_CARDS` (keep 100-entry map; assert 97 chest + 100 all).
- [x] `PLAN.md` §7: distribution note + move three rows to Arcade subsection;
      §8 changelog row.
- [x] Gates: `npx tsc -b` → `npx vitest run` → `npm run verify`.
- [x] Local smoke: Library top panel 3 gray tiles, header `/100`, main grid 97.
- [x] Commit + deploy (user: "do it and deploy").

---

## 10. Arcade Exclusives panel — Fang / Bean / Bark (user 2026-09-23)

User decisions (locked):
1. **Locked / display-only** — no arcade engine in this tree; trio stays
   unobtainable until a future trigger (matches home-repo `ARCADE_CARDS`).
2. **All three → `exclusive` tier** (leave chest band: common 39 / rare 25 /
   epic 18 / legendary 10 / exclusive 5 = **97** chest cards).
3. **Total stays 100** — `ALL_CARDS = [...CARDS, ...ARCADE_CARDS]` (97 + 3).
4. **Locked cover = existing gray style** (dimmed art + 🔒), not the home
   repo's amber bare-tile.
5. **Panel pinned at top of Library** ("🕹️ Arcade Exclusives"), ignores
   tier/search/Owned filters; main grid stays 97 chest cards.

Checklist:
- [x] Persist §10 (this block).
- [x] `cards.ts`: `source?: 'chest' | 'arcade'`; move fang/bean/bark out of
      `CARDS` into `ARCADE_CARDS` (exclusive, arcade source, unlock-condition
      flavors); export `ALL_CARDS` + `ARCADE_CARD_BY_ID`. `drawCardId` and
      `mastered` keep reading `CARDS` only.
- [x] `LibraryScreen.tsx`: `ArcadeExclusives` panel; header total = 100
      (`ALL_CARDS`); locked toast/modal copy branches on `source === 'arcade'`.
- [x] `ProfileScreen.tsx`: unique-cards denominator + ★ distribution use
      `ALL_CARDS`.
- [x] Tests: chestCards band → 39/25/18/10/5 + `CARDS` 97 + new arcade
      describe (`ALL_CARDS` 100, ids disjoint, never drawn); cardStars art
      contract over `ALL_CARDS` (100 map unchanged).
- [x] §7 roster note (97 chest + 3 arcade); §8 changelog row.
- [x] Gates: `npx tsc -b` · full `npx vitest run` · `npm run verify`.
- [x] Local smoke: top panel 3 gray tiles, header …/100, main grid 97.
- [x] Commit + `node scripts/deploy.mjs` (user asked to deploy).

---

## 11. Arcade tab port (home → Documents clone, user 2026-09-23)

Port the full Arcade experience from `C:\Users\momo\momomath-year2` into this
100-card library tree as an additional bottom-nav tab (not a replacement).

- [x] Copy arcade files: `engine/arcade.ts`, `engine/arcadeRound.ts`,
      `content/arcade{Math,Science,Words}.ts`, `components/arcade/{PixelBoss,PixelRun}.tsx`
      (home dirty Pixel Run fixes included), `screens/{ArcadeScreen,ArcadeGame}.tsx`,
      `tests/{arcadeCards,pixelRun}.test.ts`.
- [x] `gamification.ts`: `ArcadeGameDef` + `ARCADE_GAMES` (4 games) +
      `rollQuestSet(_day)` stub (Documents shows full `DAILY_QUESTS`); quest
      `arcade10` + `QuestSnapshot.arcadeCorrectToday`; achievements
      `arcadeBests`/`arcadeTop` + 3 arcade achievements.
- [x] `cards.ts`: `ARCADE_CARD_GOALS` (fang Rounds/10, bark Bosses/5, bean Games/3).
- [x] `BottomNav.tsx` + `App.tsx`: `arcade` tab (`🕹️`) before profile; route
      `<ArcadeScreen />`.
- [x] `store.ts`: arcade fields (`arcadeScores/Rounds/BossesDown/CorrectToday*`),
      actions (`addArcadeCorrect/Xp`, `submitArcadeScore`, `grantArcadeCard`,
      `checkArcadeCards`, `recordArcadeRound`); persist **v10** migration;
      `questProgressSnapshot` + achievements snapshots include arcade.
      Create callback now `(set, get)`.
- [x] `LibraryScreen.tsx`: locked exclusive cards show `goalText` +
      `progressText` (e.g. "Rounds 4/10") from `ARCADE_CARD_GOALS`.
- [x] `ProfileScreen.tsx`: Arcade best stat (`s.arcadeScores ?? {}`).
- [x] `cloudsave.ts`: optional `arcadeScores` on `CloudSave` + snapshot +
      max-merge; `applySyncedSnapshot` max-merges scores.
- [x] Tests: `arcadeCards` adapted to this clone (`PITY_LIMIT`, `ChestResult.cards`);
      `questsMultiSubject` snapshot/base extended.
- [x] Gates: `npx tsc -b` clean; full `npx vitest run` **87 files / 2465 tests green**;
      `npm run verify` OK.
- [x] Local smoke (`tmp/arcade-smoke.mjs`, port 3201): Arcade tab, Retro Arcade
      screen, 4 game cards, Library `Arcade Exclusives` panel + `/100` intact.
- [x] PLAN §8 changelog row; commit + `node scripts/deploy.mjs`.

---

## 12. Additional features (user "do it", 2026-09-25) — WS12–WS16

Coordination: §0 rules still bind — the §11 arcade port is **staged but
uncommitted**; build on top, stage only my own hunks. Free-only budget
(no paid services/APIs). Deploy (`node scripts/deploy.mjs`) ONLY when the
user asks. Gates per WS: `npx tsc -b` → full `npx vitest run` →
`npm run verify` → dev smoke `:3200`.

### WS12 — PWA install + offline (platform/polish)
- [x] `manifest.webmanifest` (name, icons from `favicon.svg` → PNG,
      `start_url` honoring gh-pages base path, theme color) + link tags in
      `index.html`.
- [x] Hand-rolled `public/sw.js`: precache hashed build assets, cache-first
      static, network-only `/api/*` + cloudsave, offline shell fallback,
      versioned precache list (bump on deploy).
- [x] Fix stale metadata: title/meta still "Maths Adventure" though the app
      has 7 subjects.
- [x] Tests/smoke: `tests/pwa.test.ts` (9 green); offline Playwright smoke
      (`tmp/pwa/offline-smoke.cjs` on `vite preview:3210`): SW controls page,
      `momo-shell-v1`/`momo-assets-v1` caches, offline reload renders shell,
      0 pageerrors. Icons: `icon-192/512.png` + `apple-touch-icon.png`
      (Edge headless render of favicon.svg → ffmpeg derive).
      **Done 2026-09-25**.

### WS13 — "Daily check-up" mixed review session (study effectiveness)
- [x] New session mode: due-for-review skills (all 7 subjects,
      `isDueForReview`) + wrong-question retry items → one ~10-question
      mixed round.
- [x] Entries: PathScreen "N skills due 🔔" banner button + Profile;
      reuse `retryItems`/`practiceRound` XP-only flow (no chest side
      effects).
- [x] Tests: due-skill selection determinism, session composition,
      XP-only accounting untouched.
      **Done 2026-09-25** — new `src/engine/adaptive/checkup.ts`
      (`dueSkillCodes` + `buildCheckup`: day-number seed, most-overdue-first
      deterministic order, fingerprint dedupe, due/wrong round-robin,
      `CHECKUP_SIZE` 10 / due cap 7 / wrong cap 5); LessonScreen gained a
      `checkup` prop + intro (existing retry intro untouched). **Fixed a
      latent crash**: `finishLesson` dereferenced `entry!` (null for ANY
      prop-entered session) and consumed double-XP before the retry branch
      — retry/check-up payout now runs first, fresh-lesson path unchanged.
      Entries: PathScreen "N skills due 🔔" banner + Profile "Daily
      check-up" card (both hide when no round exists); App `retryCheckup`
      state. Tests: `tests/adaptive/checkup.test.ts` 15 green. Gates:
      `npx tsc -b` ✓, full `npx vitest run` **89 files / 2489 green**,
      `npm run verify` ✓, dev smoke `tmp/ws13-checkup-smoke.mjs` on :3213
      (banner → intro → question → quit; Profile card; seed-no-due →
      banner/card hidden; retry 5/5 finish `ALL FIXED` + xpTotal 50→55
      through the old crash path; **0 pageerrors**; port 3213 because 3200
      is held by another session's vite — left untouched).

### WS14 — AI follow-up question after a mistake (AI; adaptive-spec deferred item)
- [x] `api/year2/followup.ts`: strict JSON `{prompt, choices, answer…}`
      with caps; BYOK headers first, deterministic fallback = sibling-
      generator re-roll (existing `makeLesson` sibling-walk).
- [x] Client `src/engine/adaptive/followup.ts` modeled on `explanations.ts`
      (cache, timeout, template fallback, never throws).
- [x] LessonScreen: "Try a similar one" offer after first-attempt wrong
      (additive hunk only — file carries chest work).
- [x] Tests: route validation + fallback; client cache/timeout.
      **Done 2026-09-25** — `api/year2/followup.ts` (standalone: BYOK-first
      free-provider chain copied from `/explain`, strict MCQ JSON validated
      by the SHARED `parseLlmMcq` — prompt ≤300, 2–4 unique choices ≤80,
      answerIndex/`answer` in range, fences/prose stripped — else next
      provider; total failure → deterministic sibling re-roll `{source:
      'sibling'}`, unknown lesson → `{source:'none'}`) + `vercel.json`
      rewrite. Client `src/engine/adaptive/followup.ts` (cache 60,
      timeout 3000 ms, local sibling re-roll seed = `hashString(lessonId|
      code|prompt)` so one mistake → one stable question, never throws —
      works offline and on gh-pages where `/api/*` 404s) + `FOLLOWUP_*`
      config + barrel export. LessonScreen (additive hunk): prefetch on
      wrong first attempt (request-id guard), 🔁 button in footer, `trySimilar`
      **splices the follow-up at `qIdx+1`** — first version appended at the
      queue END (behind remaining originals); the smoke caught it and the
      insert-next splice fixed it, original still requeued at the end by
      `handleContinue`. Tests `tests/adaptive/followup.test.ts` **21 green**
      (route: 405/400/BYOK/sibling-determinism/LLM+fences+cache/malformed→
      sibling/none; parser caps; sibling determinism+skip-original; client
      cache/404/throw/junk/timeout/never-throws; cache-key). Gates:
      `npx tsc -b` ✓, full `npx vitest run` **90 files / 2510 green**,
      `npm run verify` ✓, dev smoke `tmp/ws14-followup-smoke.mjs` on :3213
      EXIT=0 — offer after wrong ✓ → sibling "What is 1 less than 27?" ✓ →
      insert-next ordering (remaining original → requeued original) ✓ →
      correct first attempt has NO offer ✓ → retry finish `ALL FIXED` +
      xpTotal 50→52, **0 pageerrors**.

### WS15 — Streak calendar + weekly recap (engagement)
- [x] Persist capped activity log (`activityDays`, ~60 entries, max-merge
      union in cloudsave) — store persist-version bump.
      **Done 2026-09-25**: `src/engine/recap.ts` (normalise/add/merge,
      `ACTIVITY_DAYS_CAP` 60); `store.ts` v10→**v11** migrate backfills from
      `lastActiveDay` + seeds `cardsWonWeek`/`cardsWonWeekKey`; the three XP
      actions (`completeLesson`/`recordPractice`/`addArcadeXp`) call
      `markActivity`; `grantChest`/`grantArcadeCard` feed the weekly card
      counter (lazy reset on league-week roll); `applySyncedSnapshot`
      union-merges. Cloudsave both sides: client `CloudSave.activityDays` +
      `snapshotFromPlayer`/`mergeCloudSave`, server `lib/year2/cloudsave.js`
      (Default Project) sanitize + `unionDays` merge (node --check ✓).
- [x] Profile: month grid (practised days) + weekly recap card (XP,
      accuracy, subjects touched, cards won — deterministic, child-safe,
      no AI). **Done 2026-09-25**: `ProfileScreen` two new cards after the
      daily-goal section — Monday-first `buildMonthGrid` (green practised
      days, today border, future greyed) + `buildWeeklyRecap` 4-stat row
      (league-week XP, windowed accuracy %, distinct subjects canonical
      order, cards won) + "Practised N of the last 7 days" line.
- [x] Tests: day-roll, cloudsave union merge, recap math.
      **Done 2026-09-25**: `tests/recap.test.ts` **25 green** — helper
      normalise/add/merge caps+dedupe; store day-roll (practice/lesson/
      arcade marks, 60-cap, applySyncedSnapshot union); cloudsave snapshot
      whitelist + merge union + old-save tolerance; recap window/accuracy/
      subjects/cards-stale-key/active-days; month grid Monday-first + today/
      future; chest/arcade card counters + lazy week reset. Gates: `tsc -b`
      ✓, full `npx vitest run` **91 files / 2535 green**, `npm run verify`
      ✓ (no dup it-titles), dev smoke `tmp/ws15-recap-smoke.mjs` on :3213
      EXIT=0 (v10 seed → migrate filters junk → grid 2 green + today unlit →
      recap XP 42 / 50% / math·english / 0 cards / 2 active → live
      recordPractice lights today (3 active) → grantChest → cards 1 in UI →
      persisted `version: 11`, **0 pageerrors**).

### WS16 — Flashcard Sprint (english; previously deferred — now standalone screen)
- [x] Standalone screen (NOT a `LessonScreen` mode — avoids chest-rework
      file): 60s rapid-fire from existing English MCQ banks, streak
      counter, best-score persist, XP-only payout.
      **Done 2026-09-25**: new pure `src/engine/sprint.ts` (bank harvest
      `collectUnitMcqs`/`buildSprintBank` from `getCurriculum('english')`
      lesson generators — mcq-kind, validated shape, deduped, audio-only
      prompts excluded since the sprint has no playback; deterministic
      `sprintDeck` mulberry32 shuffle; `applySprintAnswer` streak rules;
      `sprintXpFor` 1 XP/correct; `sprintRemainingMs`/`isSprintTimeUp`
      clamp; `isNewSprintBest` strictly-greater; `sprintAccuracy`).
      New `src/screens/SprintScreen.tsx` (intro/playing/done, 100ms timer
      interval, 450ms feedback lock, deck reshuffle on exhaustion, ✕ pays
      out current score, NEW BEST badge). Store: local-only `sprintBest`
      / `sprintRuns` / `sprintsTodayDay` + `sprintsToday` (day-roll reset;
      **no persist-version bump** — new fields default via shallow merge),
      `finishSprint(score)` action (rollDay + counters + `markActivity` +
      `checkAchievements`), XP-only paid separately via `recordPractice`
      (no crowns/chests, lessons counter untouched). `App.tsx`
      `sprintOpen` branch + `PathScreen` english-only banner (best score)
      after the check-up banner.
- [x] Quest (`sprint1`) + achievement (additive `gamification.ts`).
      **Done 2026-09-25**: `QuestSnapshot.sprintsToday` (fed by
      `questProgressSnapshot` day-rolled) + `sprint1` quest (goal 1,
      reward 15); `AchievementSnapshot.sprintRuns` + `sprint-debut`
      "Word Sprinter" 💨; fixtures in `questsMultiSubject.test.ts`
      extended (additive fields).
- [x] Tests: timer/score rules, bank non-empty per unit.
      **Done 2026-09-25**: `tests/sprint.test.ts` **14 green** — timer
      countdown/clamp/skew, score streak rules, XP/best/accuracy, bank
      non-empty for every english unit + well-formed/deduped/visual-only,
      deck determinism + permutation, store `finishSprint` (runs/best/
      today/calendar, day-roll reset, best never downgraded), `sprint1`
      quest progress, `sprint-debut` unlock. Gates: `npx tsc -b` ✓, full
      `npx vitest run` **92 files / 2549 green**, `npm run verify` ✓ (no
      dup it-titles), dev smoke `tmp/ws16-sprint-smoke.mjs` on :3213
      **EXIT=0 ×2** — banner (best 0) → intro → 60s timer + 4 choices →
      2 correct answers via bank lookup (⭐2 🔥2) → forced time-up →
      done `TIME'S UP!` + NEW BEST + ⚡2 → store sprintBest 2 / runs 1 /
      sprintsToday 1 / xpTotal 50→52 / `sprint-debut` unlocked / quest 1 /
      activity marked / lessons still 0 → back to path "Best score: 2" →
      persisted version stays **11** (additive), **0 pageerrors**.

**Explicitly out of scope**: paid APIs/push, friend systems, per-difficulty
generator ranges + BKT re-fit (stay post-launch), touching uncommitted
arcade hunks.

---

## 13. Momo Battle — Pokémon-style card battles vs bots (user directive 2026-10-17)

**User directive (2026-10-17)**: make the collected cards act like Pokémon;
users play them against bots (for now); features like health/attack increase
with level upgrades; the game has prizes; each boss level gets harder,
Pokémon-style. **Nothing about existing user progress or other features
changes — make it a rule.**

### 13.0 RULE R0 — purely additive (user-mandated, STANDING)

Battles may only ADD. Concretely:

1. **No edits to existing mechanics or numbers**: lessons/crowns, XP & gems
   sources, `STAR_THRESHOLDS`, chest odds/pity, shop, leagues, quests,
   achievement feeds, arcade, library, cloud-sync behavior. New
   screens/files/fields/actions only.
2. **Save compat**: exactly ONE additive migrate step `version: 11 → 12`
   that only backfills battle defaults. Old saves keep every pre-existing
   field identical in meaning; `cardStars` semantics untouched — battle
   stats are DERIVED from it, never written back.
3. **Existing tests stay green with NO edits**; new coverage in new
   `tests/battle/*.test.ts` (shared-file touches, if ever needed, are
   ADD-only describes). Roster 100 → **103**: +3 battle-exclusive cards
   were user-approved 2026-10-17 (WS19 proposes the roster rows +
   free-source art; approval before coding — WS4c precedent; count-test
   updates are a locked decision, not a drift).
4. **Proof-of-no-change (acceptance gate)**: Playwright regression seeds a
   v11 save, plays a full battle session (win + loss + prize), then diffs
   the persisted store: every pre-v12 field value-identical; only the new
   battle keys differ (`battleCleared`, `battleWins`, `battleTrophies`,
   `battleSquad`, `battleDailyBossDay`, `battleDailyBossDone`,
   `cardBattleXp`). Existing smoke/verify scripts rerun unchanged.
5. **Cloud**: battle progress is **local-only first** (like `sprintBest` /
   `arcadeRounds`). Cross-device battle sync needs `lib/year2/cloudsave.js`
   in the Default-Project (`momolearn-ai`) repo — per isolation rules this
   repo's sessions must NOT edit it; the required change is REPORTED here
   as backlog **B-Cloud** for that project's own session.
6. **Free-only budget** stands (no paid services): the engine is 100%
   client-side + deterministic → works offline (PWA) and on gh-pages where
   `/api/*` 404s.
7. **Deploy discipline**: deploy ONLY when the user asks
   (`node scripts/deploy.mjs`; snapshot-before-deploy standing rule).

### 13.1 Core loop — hybrid 3v3 over COVERED content (LOCKED 2026-10-17)

- **3v3 squads**: bring 3 owned cards vs 3 bot cards; one active card per
  side; on faint the player picks the next (auto-order fallback); the
  battle ends when one side is fully down. KO = dizzy stars (kid-safe).
- **Hybrid turns (user choice)**: normal attacks resolve automatically each
  turn (stats-based); **a Power turn every 2nd turn carries a question** —
  correct ⇒ the active card fires its Special (big damage + animation);
  wrong ⇒ normal damage only. The Ultimate fires when the Team-Blast meter
  (3 correct answers) is full.
- **COVERED-ONLY rule (user-locked)**: battle questions may ONLY come from
  lessons the player has already covered in the current subject (completed
  lessons; the always-unlocked opening lessons count for a fresh save).
  Never unseen content. Selection is deterministic + fingerprint-deduped
  (reuse `makeLesson` machinery); higher gyms prefer harder covered
  generators first.
- Loss = friendly: free retry, no penalties; tiny consolation gems.
- Determinism: seeded `mulberry32` (seed = battle id + attempt) → same
  inputs, same duel; unit-testable; pure resolution (PvP-ready later).
- Reuses: `src/content/rng.ts`, covered-lesson generators, `sfx.ts` (new
  ADDITIVE battle tones), framer-motion, existing card art for bots AND
  squads (zero new art needed for battles).

### 13.2 Stats & level growth — BOTH layers (LOCKED 2026-10-17)

- **Star-derived base (zero new save data)**: `hp/atk/def` = tier base ×
  star multiplier via existing `toStar(cardStars[id])`. Star-ups from
  duplicates are the primary "level upgrade".
- **Battle levels (additive)**: wins award battle-XP to each participating
  card → `cardBattleXp: Record<string, number>` (LOCAL-ONLY first); battle
  level 1-10 ≈ +2%/level (cap ≈ +20%) on top of the star base; shown in
  the squad picker.
- Archetypes (Speed 🌀 / Power 💪 / Flight 🪽 / Chaos 🔮 / Tech 🤖 /
  Trickster 🎭) + small effectiveness cycle (×1.25 / ×0.8) — static
  per-card table (see §13.8 #1).
- Moves: 3 per card — Quick (auto), Special (Power question), Ultimate
  (Team-Blast charge); Special/Ultimate unlock at 1★ / 3★ / 5★ so
  upgrading a card visibly upgrades its kit.
- Damage (proposed): `round(atk × movePower × typeMult × (0.9 + 0.2·rand))`;
  the bot uses the SAME formula (never cheats).

### 13.3 Battle Roadmap — separate map with lock visuals (LOCKED 2026-10-17)

- **Separate roadmap** living in the ⚔️ Battle tab — NOT plugged into the
  subject paths. **Zero changes to PathScreen / curriculum / unlock chain /
  adaptive catalog** (the strongest possible R0 stance).
- 12 gyms + champion (final count in WS19); each gym = a themed villain
  squad from the roster (Eggman → Zeti → Metal → Mephiles → Infinite →
  Chaos → Black Doom → Devil Doom → Perfect Chaos → Time Eater →
  Dark Gaia → Eggman Nega → champion), with **strictly escalating
  hp/atk** — the user's "each boss gets harder".
- **Unlock gate (user: "not exactly every five" + "complete the normal
  lessons first")**: gym k unlocks at a gentle escalating count of
  COMPLETED normal lessons — curve finalized in WS19 (proposal:
  0/3/7/12/18/25/33/42/52/63/75/88 + champion ~100), **derived from the
  existing `lessonProgress`** (no new counters) and counted across ALL
  subjects so any learning advances the roadmap. No "must clear previous
  gym" requirement (avoids soft-locks); cleared gyms stay replayable.
- **Visuals (user-locked)**: big kid-friendly map in the Battle tab; node
  states 🔒 locked ("Finish N more lessons" readout) / ✨ available
  (pulsing START) / 🏆 cleared (trophy); champion node gold. Trophy
  cabinet + stats beside the map.

### 13.4 Prizes — ALL options approved (LOCKED 2026-10-17)

- All payouts via ONE new ADDITIVE store action `battleFinished()` —
  XP/gems/activity/streak bookkeeping only (never crowns, never
  `lessonsToday`; chest only via the approved first-clear path).
- Per win: gems + XP · first clear: victory chest (pure `rollChest` +
  existing `grantChest` as a NEW CALLER) + trophy · Daily Rival: one
  bonus-gem rematch/day · repeat wins: small gems (anti-farm cap).
- **Battle-exclusive cards (approved)**: +3 roster additions proposed in
  WS19 (e.g. `mecha-sonic`, `egg-dragoon`, `solaris`), unlocked at cleared
  milestones (e.g. gyms 4 / 8 / champion). As a `BATTLE_CARDS` group (like
  `ARCADE_CARDS`): total 100 → **103**, Library battle panel, free-source
  art per the WS3/WS4c pipeline; chest pool untouched. Roster rows + art
  require user approval before coding (WS4c precedent).

### 13.5 Bot AI

- Squad-aware deterministic policy: prefer strongest move when your active
  HP is low / the bot is behind; same damage caps as the player; seeded
  for tests. Fairness test: at equal stats the bot never out-damages a
  perfect player line.

### 13.6 UI surfaces (LOCKED 2026-10-17)

- ⚔️ **Battle tab** (7th BottomNav tab; labels squeeze on small phones):
  Battle Roadmap map (§13.3 visuals) → squad picker (3 owned cards, star
  row + battle level + derived HP/ATK + auto-pick-strongest) → duel (6 HP
  bars, Power-turn questions, Team-Blast meter, hit/KO animations, battle
  sfx) → result (prizes, XP, chest reveal reuse, retry, back to map).
- Trophy cabinet + battle stats panel in the tab. Daily Rival entry.
- Zero owned cards → friendly hint to win a lesson chest first.
- Phone-first, big touch targets, one-thumb, reduced-motion respected.

### 13.7 Workstreams WS17–WS25 (checklist; gates per WS: `npx tsc -b` → full
`npx vitest run` → `npm run verify` → dev smoke)

> **STANDING RULE (user-mandated 2026-10-17, see AGENTS.md R1/R2):** keep this
> checklist live and in sync — tick a box only when the work is DONE and its
> gate has passed — and do NOT stop until every box below is `[x]` (pause only
> on explicit user instruction).

- [x] **WS17 — battle stats (pure)** — DONE 2026-10-17: `stats.ts` (tier
  base table + star multiplier + battle-level curve + `deriveStats`/
  `ownedCardStats`), `archetypes.ts` (per-card map + 6-type effectiveness
  ring ×1.25/×0.8), `moves.ts` (Quick/Special/Ultimate + star unlocks 0/1/3
  and 5★ mastered bonus). Tests (14) green: tier/star/battle-level
  monotonicity, every roster card has an archetype + exactly 3 moves,
  type-mult mirror-symmetry, no `cardStars` writes. `npx tsc -b` clean.
- [x] **WS18 — duel engine (pure)** — DONE 2026-10-17: `duel.ts` (3v3 squad
  state machine, hybrid auto-attack + Power-question turn cycle, Team-Blast,
  damage/type-mult/seeded-RNG, `computeDamage` shared by both sides),
  `bot.ts` (swap policy, gym-scaled answer accuracy, spend-when-full).
  Fixed a real parity bug: the bot's power turn was `turn % 4 === 2`, which
  lands on a *player* turn (bot takes the odd turns) — so the bot fired only
  Quick and never Special/Ultimate. Corrected to `turn % 4 === 1`, and the
  banking roll now runs *before* `resolveHit` spends `rand` on damage
  variance. Bot-vs-bot now 24.46 vs 24.68 per-turn damage (0.9% apart).
  Tests (46 total, 32 new) green incl. determinism, damage bounds, purity.
  `npx tsc -b` clean; full `npx vitest run` green.
- [x] **WS19 — covered-content selector + roadmap content** — DONE 2026-10-17:
  `questions.ts` (MCQ-only harvest from COMPLETED lessons of the CURRENT
  subject, mirroring sprint.ts; deduped by prompt; deterministic seeded;
  higher gyms prefer later-unit generators; fresh-save falls back to the
  always-unlocked opening lessons) and `roadmap.ts` (12 themed villain gyms +
  champion = 13 nodes; gentle escalating unlock curve [0,3,7,12,18,25,33,42,
  52,63,75,88,100] over completed non-boss lessons; `gymBotMul` 1+0.12×(gym-1),
  `gymBotStar` clamp 1+floor(gym/2)→5, rewards `GYM_GEMS`/`GYM_XP` tables).
  Roadmap references only IN-ROSTER cards (swapped the draft `mecha-sonic`
  bot for in-roster `metal` — `mecha-sonic`/`egg-dragoon`/`solaris` stay
  WS23 exclusives). Tests (15) green: 13 nodes + champion, monotone unlock +
  reward escalation, every boss+3 bots resolves to a real roster card with an
  archetype, deterministic deduped deck ≤ cap, fresh-save fallback, purity.
  Fixed import depth (`../../content/*`) and used real curriculum lesson IDs
  (`u1l1`..) in tests. `npx tsc -b` clean; full `npx vitest run` 97 files /
  2610 tests green (battle suite 61).sh-save fallback = the always-unlocked opening
  lessons; deterministic + fingerprint-deduped via `makeLesson`
  machinery); `src/engine/battle/roadmap.ts` (13 gyms: villain squads,
  stat scaling, unlock curve derived from completed-lesson counts across
  subjects, reward/milestone table, +3 battle-card roster rows for
  approval). Tests: pool NEVER contains uncovered lessons; escalation
  strictly increasing; curve monotone; every bot id ∈ ALL_CARDS; gating
  needs no new counters.
- [x] **WS20 — store additive slice** — DONE 2026-10-17: fields
  `battleCleared`, `battleWins`, `battleTrophies`, `battleSquad`,
  `cardBattleXp`, `battleDailyBossDay`, `battleDailyBossDone`; action
  `battleFinished({gym,won,gems,xp,perCardXp})`; persist v11→**v12**
  additive migrate backfilling only the 7 battle keys. `battleFinished`
  pays gems/XP/wins/trophies/clear on a FIRST win only (repeat = no re-pay
  but still counts a win + banks card XP); per-card battle XP accrues on
  every finish (win or loss — effort still levels the squad); daily-rival
  flag rolls forward with the day. `applySyncedSnapshot` untouched by
  design → battle fields stay LOCAL-ONLY. Tests (7) green: first-clear
  pays once, repeat doesn't re-pay, loss pays nothing but banks card XP,
  day-roll reset, R0 (zero-reward finish leaves lessonProgress/xp/gems
  untouched), hostile sync snap can't overwrite the 7 fields, all keys
  present on fresh boot. `npx tsc -b` clean.
- [x] **WS21 — Battle tab + roadmap screen** — DONE 2026-10-17:
  `BattleScreen.tsx` roadmap with 🔒 locked / ✨ available / 🏆 cleared node
  visuals (per-node badge + grayscale-locked styling), trophy cabinet
  (🏆 trophies, gyms cleared /13, wins, completed-lesson counter), tap-to-open
  detail sheet showing boss + archetype + rewards (💎 gems / ⚡ battle XP /
  3 enemies) with a ⚔️ Start Battle button (available) or unlock-progress
  line (locked) + legend. Roadmap unlock helpers added to `roadmap.ts`:
  `countCompletedLessons` (completions>0, boss lessons excluded via the
  `endsWith('boss')` convention) and `isGymUnlocked` (curve + gym-1 free).
  BottomNav 7th ⚔️ Battle tab (labels shrink to `px-2` under `sm:` so 7 tabs
  fit ~360px screens). App.tsx wiring: `BattleScreen` import, `{tab ===
  'battle'}` branch, `battleGym` overlay state (placeholder branch ready for
  WS22's `<BattleDuel>`). Tests: +2 (unlock-gate block) → roadmap suite 17.
  `npx tsc -b` clean (fixed test fixture to full `LessonProgress`), `npm run
  verify` OK, full `npx vitest run` 98 files / 2617 tests green.
- [x] **WS22 — duel screen** — DONE 2026-10-17: squad picker (owned only;
  star + battle level + derived stats) → hybrid 3v3 duel (auto attacks,
  Power turns, HP bars, animations, sfx) → result screen. **Manual smoke
  PASSED** (Edge/playwright-cli, dev :3200): **WIN** gym 1 — squad picker
  auto-picked sonic·eggman·shadow → VS intro → FIGHT → 3 correct Power
  turns (specials) → "VICTORY!" + 💎14/⚡30/🏆1/📈+15 each, all persisted
  (gems 120→134, xpTotal 80→110, trophies 0→1, wins 0→1, cleared [1],
  cardXP sonic 615/eggman 15/shadow 15). **LOSS** — lone star-1 sonic vs
  👑 champion (272 seeded lessons unlock every gym) → "So close!" + 💎1/
  📈+5 each, persisted (gems 50→51, xpTotal 40, wins 0, cleared [],
  sonicXp 5). Console: **0 errors / 0 warnings**. Deck replication
  verified (gym-1 attempt-0 seed 7932 → deck[0] prompt matches the live
  first power turn). Smoke helpers in `tmp/` (mk-deck/play-*/nav-*).
- [x] **WS23 — prizes + surfaces**: `battleFinished` payouts, victory
  chest, Daily Rival, +3 battle cards (after roster approval: art, Library
  battle panel, milestones), Profile battle card (ADDITIVE). DONE: cards.ts
  gained `BATTLE_CARDS` (mecha-sonic/egg-dragoon/solaris, exclusive-tier,
  `source:'battle'`, unlock-only — chest pool untouched; ALL_CARDS 100→103) +
  `BATTLE_CARD_GOALS` (gym 4/8/13); store gained `grantBattleCard` +
  `checkBattleCards` (mirrors arcade), `battleFinished` restructured to
  return + `grantChest(rollChest('boss'))` on first clear (optional `rng`
  for determinism) and to re-check battle cards after; `DAILY_RIVAL_BONUS_GEMS`
  (+1 on the once-a-day rematch win, gated by pre-roll `alreadyDoneToday`).
  Surfaces: BattleDuel victory-chest reveal + `dailyRival` prop; BattleScreen
  Daily Rival card (rematch vs strongest cleared gym); Profile "Battle Road"
  stats card (trophies/wins/gyms); Library "Battle Exclusives" panel; App
  threads the daily-rival flag. 3 placeholder webp tiles via ffmpeg drawtext
  (fontfile=tmp/bf.ttf — colon-free path; `-frames:v 1` or lavfi loops
  forever). Fixed latent typo `egg-dragon`→`egg-dragoon` in archetypes.ts.
  Tests: cardStars/chestCards/arcadeCards bumped 100→103; new battleCards.test.ts
  (defs/goals/chest-pool exclusion/unlocks); store-battle extended (victory
  chest + daily-rival bonus/once-a-day/loss-retry). Gates: tsc clean; vitest
  101 files / 2662 green; verify OK. No deploy.
- [x] **WS24 — R0 proof + regression**: seeded v11 save → full battle
  session (win, loss, prize, battle XP) → persisted-store diff = only the
  7 new keys differ; rerun ALL existing smoke/verify scripts. THIS gate
  enforces the user's rule. DONE: new `tests/battle/ws24-proof.test.ts`
  (4 tests) seeds a full mid-game save (lessonProgress crowns, gems, cards,
  day keys pinned to today so rollDay/rollWeek/markActivity are no-ops),
  runs a COMPLETE session (gym-1 first-clear win + deterministic victory
  chest, a gym-2 loss, a Daily-Rival rematch win, and a gym-4 milestone
  clear), then JSON-deep-diffs the store. Hard guarantees: (1) lessonProgress/
  lessonsToday/lessonsTodayDay byte-identical; (2) every changed key ⊆
  ALLOWED set = the 7 battle fields + approved first-clear chest/XP path
  (gems/xpTotal/todayXp/weeklyXp/cardStars/cardPity/cardsWonWeek/
  cardsWonWeekKey) + same-day activity (lastActiveDay/activityDays) — any
  other mover fails the test; (3) the battle fields DO progress (session
  actually ran); (4) a milestone clear grants its card without touching
  lesson mastery. Regression: tsc clean; full vitest **102 files / 2666
  green**; `npm run verify` OK. No deploy.
- [x] **WS25 — polish**: animation juice, kid-tone copy, mobile one-thumb
  pass, a11y labels, offline check (`vite preview`), bundle hygiene
  (lazy-import the battle screen if needed). DONE: a11y — squad-pick toggles
  `aria-pressed` + explicit `aria-label`; victory-chest reveal + result stage
  `role="status"` (`aria-live="polite"` on the stage); decorative emoji
  `aria-hidden`; HP bars colorblind-safe (HpBar prints `hp/max` + width,
  never color alone). Reduced motion honored (global `prefers-reduced-motion`
  CSS + `MotionConfig reducedMotion="user"` in the duel). Kid-tone copy +
  one-thumb pass verified live (full-width buttons, ≥44px targets). Live Edge
  smoke (dev :3200, seeded `battleCleared:[1,2,3]`): Daily Rival card —
  **found + fixed a real copy bug** (literal `#{rivalDef.index}` → `Rematch
  #3 for an extra gem today!`; badge spacing made explicit); Library "Battle
  Exclusives" 0/3 with per-card goal + `Gyms n/m`; Profile "Battle Road"
  🏆3/⚔️5/🗺️3/13; all 3 battle webps load (naturalWidth 300); console
  **0 errors / 0 warnings**. Offline: build → `vite preview` (root 200,
  hashed JS 200, card webp 200 / 3050 B); sw.js cache-first covers new webps
  on first view — no precache change. Bundle hygiene measured: single chunk
  **975 KB raw / 301 KB gzip** → decision: NO lazy split ("if needed" = not
  needed; battle shares the all-screens chunk by architecture and a lazy
  chunk never fetched before going offline would break the offline-first
  battle tab). Also repaired local-only gitignored `.env.local` (Fish key had
  been concatenated into the `VITE_GOOGLE_CLIENT_ID` line without a newline —
  broke dev GSI sign-in and sent the polluted id to Google; newline inserted,
  nothing committed). Gates: tsc clean; full vitest **102 files / 2666
  green**; `npm run verify` OK. No deploy.

**Done when**: gym 1 winnable → prize granted; gym difficulty strictly
escalates; lock visuals correct (locked/available/cleared); loss →
friendly retry; and the R0 proof (store diff) + full suite show zero
change to existing progress/features.

### 13.8 Feature menu — "make it perfect" suggestions (pick what you like)

1. **Archetype/type cycle** (Speed/Power/Flight/Chaos/Tech/Trickster) —
   Pokémon-style depth with kid-readable icons.
2. **Move-vs-difficulty**: Special/Ultimate questions pick harder covered
   generators first (risk/reward tied to attack size).
3. **Team Blast meter** — IN CORE (§13.1): 3 correct answers charge a
   double-damage Ultimate.
4. **Tiny status set**: Shield (Knuckles/Omega), Slow (Time Eater), Heal
   (Cream), Rage (Shadow) — at most one at a time, visual pips.
5. **Villain taunts + mascot coach**: your Profile mascot reacts beside
   the duel (existing `Mascots` expressions); villains get short kid-kind
   taunt lines.
6. **Trophy cabinet** in arena + battle stats on Profile (additive).
7. **Daily Rival** — IN PRIZES (§13.4): one bonus-gem rematch per day.
8. **"Rematch +1"**: cleared gyms replay at +1 difficulty for bragging
   rights (no extra rewards).
9. **Practice mode**: free battles, 0 rewards (for fun / offline play).
10. **Colorblind-safe HP bars**, big targets, respects the existing mute.

### 13.9 Answers — LOCKED 2026-10-17

- Q1 loop: **HYBRID** — auto normal attacks; questions (covered content
  only) power Special/Ultimate moves.
- Q2 format: **3v3 team battles**.
- Q3 entry: **New ⚔️ Battle tab**.
- Q4 growth: **BOTH** — star-derived base + battle-XP levels (local-only
  `cardBattleXp`).
- Q5 prizes: **ALL** — gems, XP, trophies, first-clear victory chest,
  battle-exclusive cards ×3 (→ total 103), daily rival.
- Q6 questions from: **current subject, covered lessons only**.
- Q7 placement (follow-up): **separate battle roadmap** in the Battle tab
  with clear locked/available/cleared visuals — NOT in the subject paths;
  unlock curve is a gentle escalating lesson-count, not exactly every 5.

---

## 8. Session changelog

| Date | Session | What happened |
|---|---|---|
| 2026-09-22 | plan session | PLAN.md created; mapped repo, all 7 subject roadmaps, adaptive docs, concurrent chat's uncommitted chest rework (5 files). WS1–WS4 + §5 gaps defined. No code changes yet. |
| 2026-09-22 | decisions | Locked: free-only budget (no price tags/paid services); chest changes color live per tier on kick upgrades (green for new uncommon); keep 5 existing tiers, new tiers only with ~100-card roster; card art = I look up free images myself. |
| 2026-09-22 | WS1-social | Fixed all 17 failing social lessons (d1l2/d1l3, d2l1-d2l3, d3l1-d3l3, d4l1-d4l3, d5l1-d5l3, d6l1-d6l3): expanded match/TF/MCQ/tile/speak/order/tap banks to 7-10 entries per gen; parameterized fixed gens (gov pick, journey order, water tap, sun pick, trip order, transport pick); widened d2l3/d4l1/d4l3 gens with same-unit siblings. Files: src/content/social/d01-d06.ts only. Gate `noDuplicateQuestions -t social` 48/48 green; dupStats shows 0 social lines; tsc clean; tests/social 89/89 green. Remaining repo-wide dup: german/g10l4 only. |
| 2026-09-22 | WS1-complete | Finished remaining 40 failing lessons: arabic a03-a09 (8 lessons, banks+parameterized a7MyActivity/a8PronounMatch), religion r01-r06 (14 lessons incl. latent r1l1/r2l1/r4l1, expanded hadith/surah/adhan/wudu/etc banks, fixed order gens → banks), social already done prior, german g10l4 (expanded LETTER_SETS 2→6, WISHES 2→12, widened gens). Shared guard extraction as planned. **WS1 done-criteria met**: `npm test` 82 files / 2270 tests green; dupStats FAILING count=0; `npx tsc --noEmit` clean; `npm run build` ✓ (21s). Off-limits files untouched (parallel chat's 5-file chest rework preserved). Diagnostic artifacts cleaned. |
| 2026-09-22 | post-deploy UX | User reported (1) top navbar too wide on mobile, (2) voice feature passed without grading transcript. Fixes: TopBar overflow-hidden + scrollable subject pills + truncate league name + hide streak/gems under 420px; body `overflow-x: clip`; LibraryScreen max-w-5xl→max-w-xl. Speak: extracted `src/engine/speakGrade.ts` (unicode normWords, wordMatchScore, 0.6 threshold); LessonScreen now grades ASR transcript (missed shows "I heard vs should sound like" + retry), ASR lang via ttsLangFor(subject), self-check only when ASR unavailable, studentAnswer records real transcript. Tests: speakGrade.test.ts added; full suite 2273 green. Redeployed gh-pages index-DVDbN5Px.js verified live. |
| 2026-09-22 | WS5 | **[x] Add 2D retro side-scroller game ("Pixel Run") to the home repo `C:\Users\momo\momomath-year2` arcade** (4th `ARCADE_GAMES` entry, subject math): auto-run + jump, spike obstacles, coin pickups, Duolingo-style math question gates, finish line; ArcadeScreen route/subtitle, Bean unlock counts distinct subjects, verify-gamification 4-game update, local-only verify (tsc/vitest/precommit/dev smoke, no deploy). **Done**: tsc clean; vitest 32 files/1017 tests (new `tests/pixelRun.test.ts` 8 tests); precommit OK; local dev smoke 9/9 incl. live gate overlay + spike/coin mechanics; zero page errors. Files: gamification.ts, arcadeMath.ts (extracted), arcadeRound.ts (shared payout), PixelRun.tsx (new), ArcadeScreen.tsx, ArcadeGame.tsx, store.ts (Bean subject-count), verify-gamification.mjs, both PLAN.md. |
| 2026-09-23 | WS4a-math | Expanded each math unit toward 6–8 non-boss lessons + boss: added 19 practice/quiz lessons (u3l6, u5l5-6, u6l5-6, u7l6, u8l4-6, u9l5-6, u10l4-6, u11l5-6, u12l5-6, u13l6) reusing only pre-existing Cambridge objective codes and existing generators (gDoubles/gDoubleTwoDigit finally wired in). Nodes 73 → 92 (79 non-boss + 13 boss). Files: src/content/curriculum.ts only (boss stays last; path/curriculum/adaptive tests needed no edits). Verify: `npx vitest run` 83 files / 2450 tests green (incl. path, curriculum, noDuplicateQuestions seeds 0/1/42/7, dupStats count=0, adaptive suite); `npx tsc --noEmit` clean. |
| 2026-09-23 | WS4c-roster | **PLAN §7 drafted + 19→29-card expansion within the existing 5 tiers (no new tiers — user locked that 2026-09-23; uncommon/mythic formally struck from §4b)**. (1) `CardDef.id` widened `MascotId`→`string` (new ids stay disjoint from playable MascotIds; `mascots.test.ts` untouched/green). (2) Wired all 11 previously-unused webps: 10 new cards (movie-tails→common, classic-sonic/werehog-sonic/movie-knuckles→rare, movie-sonic/movie-shadow/neo-metal→epic, super-shadow/hyper-sonic/hyper-shadow→legendary) + `super` repointed `super.svg`→`super-sonic.webp`. Shipped distribution 6/8/8/5/2 = 29; every shipped image exists on disk (test-asserted). (3) §7 filled with full 98-row draft roster (40/25/18/10/5; 69 rows ⬜ art-pending, free-source art task + user roster approval still open before those are coded). (4) `CARD_BY_ID` audit: no `!` non-null assertions anywhere; LessonScreen:903-904 already guards `if (!def) return null`; tests use `?.` — no fallback change needed. (5) New tests (ADD-only describes in `tests/chestCards.test.ts`): roster band 29–98, per-tier plan ranges, non-empty pools, id uniqueness + CARD_BY_ID identity, image-exists-on-disk, CARD_CHANCE strict monotonicity common→exclusive, PACK_SIZE 1≤min≤max≤3. (6) `tests/cardStars.test.ts` moved with content (19→29 exact map, super→super-sonic.webp, svgIds 8→7). **Verify**: `npx tsc --noEmit -p tsconfig.json` exit 0; `npx vitest run` 82 files / 2280 tests green. Files: src/engine/cards.ts, tests/chestCards.test.ts, tests/cardStars.test.ts, PLAN.md. Not committed/deployed. |
| 2026-09-23 | WS2 | **Chest animation now a pure function of ChestResult (invariants A–D).** Inventory: local drifted TIER_META/TIER_RANK in LessonScreen vs cards.ts; Library frames via RARITY_META[TIER_TO_RARITY] rendered exclusive as legendary gold; live tier was manually-advanced state and reveal badge/glow keyed off it rather than finalTier; grid div rendered at 0 tiles; unknown-id tiles dropped via `if (!def) return null`; reveal showed raw gems/dust while grantChest ×2-doubles all-maxed packs (displayed ≠ persisted). Copy-line branches (B) already matched plan order. Fixes (built on top of the parallel chest rework, nothing reverted): cards.ts gained pure `kickTierSequence`/`chestCopyVariant`/`chestTileCount`/`chestPayout`; LessonScreen imports the ONE shared TIER_META/TIER_ORDER/KICKS (local map deleted), derives `currentTier` from the rolled upgradesAt chain (settles finalTier at reveal), headline = switch over chestCopyVariant, grid gated on chestTileCount with fallback tiles, totals = chestPayout; store grantChest computes its delta via the same chestPayout; LibraryScreen frames/hidden style/toast/modal/ladder now use cards.TIER_META (exclusive = magenta). Tests: 4 new ADD-only describes (+13 tests) in chestCards.test.ts — B/C pure mapping {copyVariant, tileCount, tierBadge}, A kick-sequence == [start, ...upgradesAt chain] + exact-kick changes + monotonicity, economy monotonicity (CARD_CHANCE strictly decreasing over exported TIER_ORDER, PACK_SIZE 1≤min≤max≤3 non-decreasing maxes, slot ceiling, TIER_META coverage), D chestPayout == grantChest gem delta (×1/×2/jackpot); existing tests untouched. Gates on the combined tree (incl. parallel WS4c roster + english-terms work): chestCards 41/41; `npx tsc --noEmit -p tsconfig.json` clean; full `npx vitest run` 83 files / 2450 tests green. Files: src/engine/cards.ts, src/engine/store.ts, src/screens/LessonScreen.tsx, src/screens/LibraryScreen.tsx, tests/chestCards.test.ts, PLAN.md. WS2 step 7 (manual dev smoke) NOT run this session — still pending. Not committed/deployed. |
| 2026-09-23 | science-doc + english-terms | Created `docs/science-roadmap.md` (Task A: reverse-engineered from s01–s06 — honesty, 6-unit/38-node table, integration, verify). Shipped 3 English Term Challenges (Task B): `e5term`/`e10term`/`e13term` in new `src/content/english/terms.ts`, wired into e05/e10/e13 immediately before each boss; 30-item exam formats (tick-box MCQ, order, match heading, find-and-copy, TF), no hints, Gold/Silver/Bronze (`termMedal`), 20 XP; `LessonScreen` uses `questionsForLesson` for n=30 + medal badge on done screen. Flashcard Sprint **deferred** (needs new timed UI in LessonScreen alongside parallel chest rework; e4l5 already drills rapid exception words). Files: docs/science-roadmap.md (new), src/content/english/{terms.ts,e05,e10,e13}.ts, src/screens/LessonScreen.tsx, tests/english/terms.test.ts (new), PLAN.md, docs/english-roadmap.md. Verify: `npx tsc --noEmit` clean; `npx vitest run tests/english tests/englishRegistry.test.ts tests/noDuplicateQuestions.test.ts` = 16 files / **945 tests green**; scienceRegistry 82 green. English nodes 74→77 (registry asserts structure not count). |
| 2026-09-23 | WS4c-art | **Completed WS4c: all 69 ⬜ art-pending cards sourced, coded, and verified — roster 29→98 (40 common / 25 rare / 18 epic / 10 legendary / 5 exclusive; no new tiers).** Art: free sonic.fandom.com wiki media only (MediaWiki API page resolution + `curl.exe` with browser UA + `Referer: https://sonic.fandom.com/` — node `fetch` gets HTTP 403 on the wikia CDN), ffmpeg libwebp ≤800px / q78 / ≤400KB / 1 frame → `public/cards/<id>.webp`; pipeline + manifest in `tmp/ws4c-art/` (`fetch-art.mjs`, `manifest.json`); every image vision-verified (movie-stone swapped to a non-poster SM3 face; faker HUD-cropped `crop=190:165:75:55,scale=800:flags=neighbor`; super-knuckles kept — `File:Super Knuckles running.png` fetch returned a 520-byte stub). Coded: all 69 appended to `CARDS` in `src/engine/cards.ts` with §7 tiers/names/flavors verbatim; section comments 6/8/8/5/2 → 40/25/18/10/5; doc comment now "98 cards". Tests: `cardStars.test.ts` art contract 29→98 exact map + `toHaveLength(98)`; `chestCards.test.ts` WS4c roster bands retightened to exact 40/25/18/10/5 + `toBe(98)`; image-exists loop covers all 98. PLAN.md §7 all 69 rows ⬜→✅, §4c steps 1–3 ticked, section headers/totals updated. **Verify**: `npx tsc --noEmit -p tsconfig.json` exit 0; `npx vitest run` **83 files / 2450 tests green**. Files: src/engine/cards.ts, tests/cardStars.test.ts, tests/chestCards.test.ts, PLAN.md, public/cards/*.webp (69 already on disk from this art run), tmp/ws4c-art/* (gitignored pipeline). Not committed/deployed. |
| 2026-09-23 | WS3-cardart | Replaced all 8 SVG card drawings with real painted art from FREE sources only (Sonic Fandom wiki CDN hosting official SEGA stock/channel artwork; no paid APIs/stock): charmy → `Charmy Bee sonic channel.png`, big → `Sonic Channel - Big the Cat 2013.png`, ray → `Ray the Flying Squirrel (Archie).webp` (rejected `Ray Project 20.png` — User-images category, actually Tails art), vector/espio/omega → `Sonicchannel *_nocircle.png`, jet → `Sonic-Free-Riders-Jet-artwork.png`, super → existing `super-sonic.webp`. Converted with ffmpeg libwebp (≤800px wide, alpha kept, 41–137KB) to `public/cards/<id>.webp`; all 8 `cards.ts` `image:` fields repointed (`.svg` refs in cards.ts = 0); 8 superseded SVGs moved to `archive/card-svgs/`; `tests/cardStars.test.ts` art contract updated (29-card exact map + "every card .webp"); §7 shipped rows updated to `.webp`. Verify: `npx vitest run tests/chestCards.test.ts tests/cardStars.test.ts tests/mascots.test.ts` = 51/51 green; `npx tsc --noEmit -p tsconfig.json` clean. NOTE: image-read attachments glitched this session (stale media) — character IDs cross-checked via ffmpeg ASCII/alpha/color stats + Fandom wikitext categories. Files: public/cards/{charmy,big,ray,vector,espio,omega,jet}.webp (new), archive/card-svgs/ (8 moved), src/engine/cards.ts, tests/cardStars.test.ts, PLAN.md. |
| 2026-09-23 | WS3-finish | Closed WS3 steps 3–6. (3) Library art contract verified via Playwright `tmp/ws2-smoke/ws3_visual.py` on `?library`: locked cards use `getHiddenCardStyle` + no art `<img>`; owned cards `object-cover` with `naturalWidth>0`; no letterboxing seams on the 8 new webps. (4) Mascot parity **noted, not upgraded**: all 19 `MascotId`s (incl. the 8 WS3 chars) intentionally remain drawn SVG avatars in `src/components/mascots/Mascots.tsx` — they need live expressions (blink/mouth/sad); `tests/mascots.test.ts` asserts SVG markup + signature gradients; card art and mascot avatars are separate surfaces. (5) Visual pass: All + 5 tier filters + all 8 WS3 detail modals → `WS3 VISUAL PASS`; 14 screenshots in `tmp/ws2-smoke/shots/ws3-*.png`; chest-reveal art already covered by WS2 smoke. (6) Gates: `npx vitest run` 83/2450 green; `npx tsc -b && vite build` ✓ (15.95s). Done-when met: 0 `.svg` refs in `cards.ts`/`src/`/`public/cards/*.svg`. |
| 2026-09-23 | WS4a/4b-closure + roadmap-verify | Closed remaining WS4a steps 2–5 and all of WS4b without inventing scope. WS4a-2: audited every roadmap — german/arabic/religion/social/science say "gaps: none known"; english gaps are features/audit not unit expansion → no new subject lessons. WS4a-3: `QUESTIONS_PER_LESSON` stays 10 (not asked). WS4a-4: path 5 + curriculum 282 green (no absolute-total assertions). WS4a-5: `tests/adaptive/*` 8 files green; `buildCatalog` is lazy over `getCurriculum()` so WS4a's 19 practice lessons auto-enter. WS4b-1: 5-tier lock confirmed; 4b-2 N/A (no new tiers); 4b-3: `CARD_CHANCE` strict common→exclusive monotonicity already asserted in chestCards (mythic N/A); 4b-4: `STAR_THRESHOLDS` kept (user never asked). Roadmap §4 verify blocks for german+arabic+religion+social+science **all green** (combined 37 files / 552 tests). PLAN.md steps ticked. |
| 2026-09-23 | english-audit + §5.1 gaps | **(1) english-audit-spec pass DONE** — QA hand-audit of every generator bank e01–e13 + temp invariant dump over seeds 42/7 (mcq choices/answerIndex, tiles 3–10 lowercase, story lines ≤90 chars, match-pair sanity, tap-count target math): 154/154 green, temp file deleted after run. **23 content fixes, content files only, no unit restructure**: **e02** mon·ster gloss "a spooky costume"→"a scary creature" (monster ≠ costume); **e04** HOMOPHONE_FILLS_2 "My feet are bare…" was missing ___ (answer visible in prompt) → "My feet are ___…"; **e05** TIME_OPENERS[0] missing ___ (answer "Then" embedded in the full-sentence prompt) → blank inserted; **e09** intro body "…and or offers a choice" garbled → quoted joiners; **e10** 5 `gSpotRhyme` distractor pairs that THEMSELVES rhyme (trail/fail, bee/knee, frog/bog, goat/boat, mouse/louse — kid could pick a second correct answer) replaced with non-rhyming pairs + typos/scene ("The Class caterpillar"→Caterpillar, "The Spiders Web"→"The Spider's Web", scene [" sawdust"]→🪵, "Every clack of claps"→"Every round of claps", "Riddle Miss Okafor"→"Miss Okafor and her riddles") + 5 `gWhereAreThey` stories given their place word in-line (park/library/museum/cafe/zoo — hint promised "the place word inside the story" but answers were only inferable, and park-vs-farm was defensible for ducks+pond); **e13** gFactGroup ambiguity where ≥1 distractor equally suited the heading ("Life of a Sea Turtle"→"Where Sea Turtles Are Born", "The Water Cycle"→"How Puddles Disappear", yawn distractors "contagious/tired"→non-why statements, "Magnets have two poles"→junkyards). **Unfixed observations (by design, not errors)**: mcq audioText for "Which spelling did you hear?" is the containing sentence (homophones disambiguated by context; word-level hear items all satisfy the say() rule); wow-word/exciting-sentence distractors are deliberately dull-but-grammatical (mechanic is "best fit"); e1l4 intro blurb says "target sound" while the shipped exercise is exact-word tap (prompt+hint self-consistent). **(2) §5.1 gap 2 CLOSED by decision: NO new `audio-mcq`/`dictation` kinds** — mcq+audioText and order+audio cover catalogue #3/#13; new LessonScreen modes deferred post-launch. **(3) Gap 3 Flashcard Sprint deferral confirmed** (unchanged). **(4) Gap 4 adaptive tail marked POST-LAUNCH** — no adaptive-engine touches in WS1–WS4 beyond the catalog. **Gates**: english+registry 15 files/273 green; roadmap §4 verify blocks re-run green — german+arabic+religion+social combined 36/470, science (scienceRegistry+noDup) 754; full `npx vitest run` 83 files/**2450 green**; `npx tsc --noEmit -p tsconfig.json` clean. Files: src/content/english/{e02,e04,e05,e09,e10,e13}.ts, PLAN.md. Off-limits (TopBar/speak/cards/adaptive/chest/math) untouched. |
| 2026-09-23 | §9 A+B1–B5+C1/C2 | **All §9 items done [x]**: C1 roster 98→100 (`maria` common + `chao` rare; distribution 41/26/18/10/5; `public/cards/` exactly 100 `.webp`; orphans honey/flicky deleted; cardStars/chestCards assert 100; Library real art on every tile, locked = dimmed + 🔒 not `?`; imgcheck 100/100). C2 hardened START_TABLES / CARD_CHANCE / KICK_UPGRADE — joint odds strictly decrease in all 4 contexts, pity preserved. A: PathScreen empty-state → generic "No roadmap here yet". B1: `tests/contentQaSubjects.test.ts` (16) green; findings documented in §9 (binary A/B prompts by design, match rights de-duped by matchLayout, fingerprint uniqueness via everyLesson + 8 seeds). B2: `subjectsToday` day-roll + subjects2/subjects3 quests + subjects-3/subjects-5/cards-10/cards-40 achievements + `subjectOfLesson`; `questsMultiSubject.test.ts` (6). B3: lucky-ticket copy (start odds + card drops); shop 19/19. B4: onboarding smoke welcome → path/lesson, 0 pageerrors. B5: Library search + Owned filter + tier tabs; search "maria" → 1 tile. Gates: `npx tsc -b` clean; full `npx vitest run` green; `npm run verify` OK. Files: cards.ts, store.ts, gamification.ts, shop.ts, LibraryScreen.tsx, PathScreen.tsx, tests/{contentQaSubjects,questsMultiSubject,cardStars,chestCards,shop}, public/cards/*.webp, PLAN.md. Not committed/deployed. |
| 2026-09-23 | WS5-gameplay | **Pixel Run gameplay revision (user request): Sonic character, coin-friendly jump, safe coin placement, gate benefit/drawback.** (1) Player = Sonic `<Mascot id="sonic">` (happy/excited/cheer expressions, cyan shield ring; `aria-label="Runner"` kept for smoke scripts; PLAYER_W 22?26). (2) Jump retuned so a well-timed jump sweeps the whole coin arc: GRAVITY 0.55?0.6, JUMP_V?10.2 (apex �87 > coin top 52), coin hitbox +6px generous, arc spacing 24 / heights 8/34/52/34/8. (3) Coins never lead into obstacles: new pure `planFeatures(rand, fromX, untilX)` sequential spawner (spike ~45% / arc ~55%, shared cursor, `GATE_CLEAR=80`, `COIN_GAP_AFTER=130`, stops before finish-140) + layout-invariant tests. (4) Gate outcomes clear: correct = GATE_SCORE 20?**50** + 30 coins + **4s shield** (spikes pass through, cyan ring); wrong = -1 life + **WRONG_PENALTY=30** score (floor 0) + i-frames; live HUD ???/?n; over-screen shows wrong total. (5) ProfileScreen `/3 games` ? `ARCADE_GAMES.length`. Exclusives confirmed still rendering (Library panel 3 tiles). **Verify**: tsc clean; vitest 32 files/**1022** tests (pixelRun 13 incl. planFeatures invariants); precommit OK; local smoke **13/13** (jump +73px, gate overlay + HUD penalty, exclusives); deployed gh-pages `index-CxsAI_FX.js`; live `verify-gamification` **42/42**. Files: src/components/arcade/PixelRun.tsx, src/screens/ProfileScreen.tsx, tests/pixelRun.test.ts, both PLAN.md. |
| 2026-09-23 | §10 arcade-exclusives | **Fang/Bean/Bark moved to arcade exclusives (user decisions locked).** (1) `cards.ts`: `source?: 'chest'|'arcade'`; removed trio from `CARDS` → chest pool **97 (39/25/18/10/5)**; added `ARCADE_CARDS` (all exclusive, source arcade, unlock-condition flavors), `ALL_CARDS` (100), `ARCADE_CARD_BY_ID`; `drawCardId`/`mastered` still read `CARDS` only. (2) Library: top `🕹️ Arcade Exclusives` panel (x/3 collected, existing gray locked style: dimmed art + 🔒 + condition line); header total = `ALL_CARDS.length` (100); locked toast + modal obtain copy branch on `source === 'arcade'`; tier/search/Owned still filter only the 97-card main grid. (3) Profile unique-cards + ★ distribution use `ALL_CARDS`. (4) Tests: chestCards band → 39/25/18/10/5 + `toBe(97)` + new arcade describe (`ALL_CARDS` 100, ARCADE disjoint/exclusive/source/images, `rollChest` never drops them); cardStars art contract over `ALL_CARDS` (100-entry map kept). (5) PLAN §7 renumbered + Arcade subsection; §10 checklist. **Gates**: `npx tsc -b` clean; full `npx vitest run` **85 files / 2442 tests green**; `npm run verify` OK. Local smoke: arcade panel 3 tiles, header `/100`, main grid 97, exclusive tab 5, search fang → 0 main + panel intact. Files: src/engine/cards.ts, src/screens/LibraryScreen.tsx, src/screens/ProfileScreen.tsx, tests/{chestCards,cardStars}.test.ts, PLAN.md. |
| 2026-09-23 | §11 arcade-tab | **Ported the full Arcade tab from the home clone into this 100-card tree (user: additional page, keep library).** Surgical file port (no `git merge` — 16 conflicts). Copied 11 arcade files incl. dirty Pixel Run fixes (`JUMP_V 10.2`, `planFeatures`); wired `ARCADE_GAMES` (4) + `rollQuestSet` stub, `arcade10` quest, 3 arcade achievements, `ARCADE_CARD_GOALS`, BottomNav+App arcade tab, store arcade state/actions persist **v10**, Library locked goal/progress text, Profile arcade best, cloudsave optional `arcadeScores` max-merge. Fixed tests for this clone (`PITY_LIMIT`/`ChestResult.cards`, quest/achievement snapshot fields). **Gates**: `npx tsc -b` clean; full `npx vitest run` **87 files / 2465 tests green**; `npm run verify` OK. Smoke: Arcade tab → Retro Arcade + 4 games; Library panel + `/100` intact (CORS leaderboard noise local-only). Files: arcade engine/content/screens/components + App, BottomNav, cards, gamification, store, cloudsave, LibraryScreen, ProfileScreen, tests, PLAN.md §11. |
| 2026-09-25 | WS12-pwa | **PWA install + offline (§12).** `public/manifest.webmanifest` (base-path-aware `start_url`, theme color) + link tags; hand-rolled `public/sw.js` (versioned `momo-shell-v1`/`momo-assets-v1` precache, cache-first static, network-first navigations, network-only `/api/*` + cloudsave, offline shell fallback); `icon-192/512.png` + `apple-touch-icon.png` (Edge headless render of favicon.svg → ffmpeg); stale "Maths Adventure" title/meta → "Momo Year 2 Cambridge · Learning Adventure"; SW registration in `src/main.tsx` (PROD + http only). Tests `tests/pwa.test.ts` 9 green; offline Playwright smoke on `vite preview` (SW controls page, both caches present, offline reload renders shell, 0 pageerrors). Committed `43b00f0`; deployed 2026-09-25 (gh-pages `assets/index-DcQCikWz.js`). |
| 2026-09-25 | WS13-checkup | **Daily check-up mixed review session (§12) + fixed a latent crash in `LessonScreen.finishLesson`.** New pure `src/engine/adaptive/checkup.ts`: `dueSkillCodes` (cross-subject `isDueForReview`, most-overdue-first, insertion-order independent, ties break on code) + `buildCheckup` (day-number default seed → stable per day; due items generated from each code's own lesson slot; wrong items = exact `recentWrong` snapshots; round-robin due-first interleave; `questionFingerprint` dedupe; caps 10/7/5; never mutates inputs; empty round → entries hidden). LessonScreen: `checkup?: boolean` prop + check-up intro before the untouched retry intro; **bugfix** — `finishLesson` ran `entry!.lesson…` (crash: `entry` is null for every prop-entered retry) and consumed double-XP before the retry branch; retry/check-up payout now returns first (XP-only `recordPractice`, no crowns/chests), fresh path unchanged. App `retryCheckup` state; PathScreen "N skills due 🔔" banner; ProfileScreen "Daily check-up" card. Tests `tests/adaptive/checkup.test.ts` **15 green** (due selection/determinism, composition/dedupe/caps, seed stability, no mutation, XP-only store accounting). Gates: `npx tsc -b` ✓; full `npx vitest run` **89 files / 2489 green**; `npm run verify` ✓; dev smoke `tmp/ws13-checkup-smoke.mjs` :3213 — banner/intro/question/quit, Profile card, hidden-when-empty, retry 5/5 `ALL FIXED · +5 XP` + xpTotal 50→55 through the old crash path, 0 pageerrors (3200 occupied by another session's vite — not touched). Files: src/engine/adaptive/{checkup,lessons,index}.ts, src/screens/{LessonScreen,PathScreen,ProfileScreen}.tsx, src/App.tsx, tests/adaptive/checkup.test.ts, PLAN.md. Committed `43b00f0`; deployed 2026-09-25 (gh-pages `assets/index-DcQCikWz.js`). |
| 2026-09-25 | WS14-followup | **AI follow-up question after a mistake (§12 WS14).** New `api/year2/followup.ts` (standalone: BYOK-first ranked free-provider chain copied from `/explain`; strict MCQ JSON `{prompt, choices, answerIndex|answer}` validated by the SHARED `parseLlmMcq` with caps — prompt ≤300 chars, 2–4 unique choices ≤80, index in range, markdown fences/prose stripped — malformed reply skips to the next provider; no keys/all fail → deterministic sibling-generator re-roll `{source:'sibling'}`, unknown lesson → `{source:'none'}`) + `vercel.json` rewrite. New client `src/engine/adaptive/followup.ts` modeled on `explanations.ts` (in-memory cache 60, 3000 ms timeout, `byokHeaders`, local sibling re-roll with seed `hashString(lessonId|code|prompt)` → one mistake always maps to one stable question; never throws — works offline and on gh-pages where `/api/*` 404s) + `FOLLOWUP_ROUTE/CACHE_SIZE/TIMEOUT_MS` in config + barrel exports. LessonScreen **additive hunks only**: prefetch on wrong first attempt (request-id guard against late answers), 🔁 "Try a similar one" footer button, `trySimilar` splices the follow-up at `qIdx+1` (initial version appended at queue END — dev smoke caught it showing a remaining original first; insert-next fixed it while `handleContinue` still requeues the missed original at the end). Tests `tests/adaptive/followup.test.ts` **21 green** (route validation/BYOK/sibling determinism/LLM+fences+per-cacheKey caching/malformed→fallback/none; parser caps; client cache/404/throw/junk/timeout-never-throws; cache-key stability). Gates: `npx tsc -b` ✓; full `npx vitest run` **90 files / 2510 green**; `npm run verify` ✓; dev smoke `tmp/ws14-followup-smoke.mjs` on :3213 **EXIT=0** — offer after wrong → browser-predicted sibling question ("What is 1 less than 27?") renders → insert-next ordering verified (remaining original → requeued original) → correct first attempt gets NO offer → retry `ALL FIXED` + xpTotal 50→52, **0 pageerrors**. Files: api/year2/followup.ts, src/engine/adaptive/{followup,config,index}.ts, src/screens/LessonScreen.tsx, vercel.json, tests/adaptive/followup.test.ts, tmp/ws14-followup-smoke.mjs, PLAN.md. Committed `43b00f0`; deployed 2026-09-25 (gh-pages `assets/index-DcQCikWz.js`). |
| 2026-09-25 | WS15-recap | **Streak calendar + weekly recap (§12 WS15).** New pure `src/engine/recap.ts`: capped activity-day log (`ACTIVITY_DAYS_CAP` 60 — normalise filter/dedupe/sort/slice, `addActivityDay`, `mergeActivityDays` union) + `buildWeeklyRecap` (7-day local window: league-week XP passthrough, windowed accuracy % rounded, distinct subjects in canonical order, cards won gated on week-key match, active days in window) + Monday-first `buildMonthGrid` (today highlight, future greyed, practisedCount) + `subjectOfLesson` mirror. `store.ts` persist **v10→v11** (migrate backfills `activityDays` from `lastActiveDay`, seeds `cardsWonWeek`/`cardsWonWeekKey`; initial state fields); `completeLesson`/`recordPractice`/`addArcadeXp` mark the day; `grantChest` (+cards.length) / `grantArcadeCard` (+1) feed `cardsWonWeek` with a lazy reset when the league week rolls (bump helper, no churn at the weeklyXp reset sites); `applySyncedSnapshot` union-merges `activityDays`. Cloudsave union both sides: client `CloudSave.activityDays?` + `snapshotFromPlayer`/`mergeCloudSave`, server `lib/year2/cloudsave.js` (Default Project — sanitize ISO-only + sort + 60-cap, `unionDays` in `mergeSaves`; `node --check` ✓; not deployed). ProfileScreen two additive cards after daily goal: practice calendar (green practised cells / today border / `M T W T F S S` header / "Month · N days") + weekly recap (⚡ XP · 🎯 accuracy % + x/y answers · 🗂️ subjects · 🃏 cards won + "Practised N of the last 7 days"). Tests `tests/recap.test.ts` **25 green** (helper caps/dedupe; day-roll via fake `Date` for practice/lesson/arcade + 60-cap + snapshot union; cloudsave snapshot whitelist/merge union/old-save tolerance; recap window/accuracy/subjects/stale-key/active-days/XP passthrough; month grid Monday-first/today/future; card counters incl. real `rollChest` + lazy week reset). Gates: `npx tsc -b` ✓; full `npx vitest run` **91 files / 2535 green**; `npm run verify` ✓; dev smoke `tmp/ws15-recap-smoke.mjs` :3213 **EXIT=0** — v10 seed migrate filters `bad-day` → grid 2 green, today unlit → recap ⚡42 / 🎯50% 1/2 / math·english / 🃏0 / 2 active → live `recordPractice` lights today (3 active) → `grantChest` → 🃏1 in UI → persisted `version: 11`, **0 pageerrors**. Files: src/engine/{recap,store,cloudsave}.ts, src/screens/ProfileScreen.tsx, lib/year2/cloudsave.js (Default Project), tests/recap.test.ts, tmp/ws15-recap-smoke.mjs, PLAN.md. Committed `43b00f0`; deployed 2026-09-25 (gh-pages `assets/index-DcQCikWz.js`). |
| 2026-09-25 | WS16-sprint | **Flashcard Sprint (§12 WS16 — the last workstream).** New pure `src/engine/sprint.ts`: 60s round constants; `collectUnitMcqs`/`buildSprintBank` harvest validated mcq-kind questions from every english unit's `lesson.generate` (2–4 unique choices, in-range answerIndex, prompt-deduped, audio-only prompts excluded — the sprint is fully visual), deterministic mulberry32 `sprintDeck`, `applySprintAnswer` (correct +1 score + streak, wrong resets streak, bestStreak kept), `sprintXpFor` 1 XP/correct, clamped `sprintRemainingMs`/`isSprintTimeUp`, strictly-greater `isNewSprintBest`, `sprintAccuracy` (rounded % or null). New `src/screens/SprintScreen.tsx` (intro → playing → done; 100ms interval timer + progress bar, 450ms feedback lock, deck reshuffle on exhaustion, ✕ during play pays out the current score, done screen shows score/best-streak/accuracy/XP/NEW BEST + Play again). Store additive fields `sprintBest`/`sprintRuns`/`sprintsTodayDay`/`sprintsToday` (**no version bump** — v11 shallow-merge defaults), day-roll reset in `rollDay`, `finishSprint(score)` action (counters + `markActivity` + `checkAchievements`); XP-only payout goes through the existing `recordPractice` (streak/dailies/calendar move; lessons/crowns/chests untouched). `gamification.ts` additive: `QuestSnapshot.sprintsToday` + `sprint1` quest (goal 1, reward 15), `AchievementSnapshot.sprintRuns` + `sprint-debut` "Word Sprinter" 💨; `questProgressSnapshot` feeds the day-rolled counter; `checkAchievements` snap extended. UI wiring: `App.tsx` `sprintOpen` full-screen branch, `PathScreen` english-only sprint banner (current best) after the check-up banner. Tests `tests/sprint.test.ts` **14 green** (timer countdown/clamp/skew, streak rules, XP/best/accuracy, **bank non-empty for every english unit** + shape/dedupe/visual-only, deck determinism/permutation, `finishSprint` runs/best/today/calendar + day-roll + no-best-downgrade, `sprint1` progress, `sprint-debut` unlock) + `questsMultiSubject` fixtures extended. Gates: `npx tsc -b` ✓; full `npx vitest run` **92 files / 2549 green**; `npm run verify` ✓ (no dup it-titles); dev smoke `tmp/ws16-sprint-smoke.mjs` :3213 **EXIT=0 ×2** — banner→intro→60s timer/4 choices→2 correct taps (⭐2 🔥2)→forced time-up→done NEW BEST + ⚡2→store sprintBest 2/runs 1/today 1/xp 50→52/`sprint-debut` unlocked/quest 1/activity marked/lessons 0→banner "Best score: 2"→persist version stays 11, **0 pageerrors**. Files: src/engine/sprint.ts (new), src/screens/SprintScreen.tsx (new), src/{engine/store,engine/gamification,screens/PathScreen,App}.tsx, tests/sprint.test.ts (new), tests/questsMultiSubject.test.ts, tmp/ws16-sprint-smoke.mjs, PLAN.md. Committed `43b00f0`; deployed 2026-09-25 (gh-pages `assets/index-DcQCikWz.js`, live-verified incl. sprint/recap/checkup/followup markers). **§12 WS12-WS16 complete.** |
| 2026-10-17 | battle-plan | **§13 Momo Battle planned + all decisions LOCKED (user Q&A).** Hybrid **3v3** battles over **covered content only** (auto normal attacks; questions power Special/Ultimate moves); **separate Battle Roadmap** in a new ⚔️ Battle tab (12 gyms + champion, strictly harder each step, gentle escalating lesson-count unlock curve derived from existing `lessonProgress`, clear locked/available/cleared visuals — zero changes to subject paths); stats = star-derived base **+ battle-XP levels** (local-only `cardBattleXp`); prizes = gems/XP/trophies/first-clear chest **+3 battle-exclusive cards (100→103, roster approval pending)**/daily rival; **RULE R0 — purely additive** with the proof-by-store-diff gate over the 7 expected new keys + zero-edit test policy. WS17–WS25 checklist + feature menu ready. No code changes yet; awaiting user go. |
| 2026-10-17 | tts-voices-port | **Landed the premium Fish Audio voices on `main` via a voices-ONLY safe port (NOT the 88-commit merge — the two clones had diverged 14 vs 88 commits).** 3 commits: battle checkpoint `e102e12`; voices runtime `a1dadcd` (`src/engine/ttsPremium.ts` + premium-aware `src/engine/tts.ts` (a superset of main's multi-lang API) + 5,984 `public/tts/*.mp3` + `manifest.json`); tooling `6074b83` (`scripts/generate-tts.mts`+`tts-corpus.mts`+`verify-tts.mjs` + `tests/ttsPremium.test.ts` 14 green). Added **AGENTS.md R4** voices standing rule (premium layer with Web-Speech as fallback-only, Sonic/Tails/Knuckles cast, Fish-key generation path, deploy hygiene, new speaking UI must use `speak()`). Gates: `npx tsc -b` clean; full `npx vitest run` 99 files / 2636 green. **CAVEAT**: the 5,984 clips were generated from the tts branch's content corpus (`tts-corpus.mts` imports `src/content/english/books`, which main lacks); my main's content diverged (e01–e12, arcade, BKT), so premium coverage on main is PARTIAL — main-only strings fall back gracefully to device Web Speech. Full coverage = adapt the corpus to main's content schema + run `generate-tts.mts` with `FISH_AUDIO_API_KEY` (follow-up task; costs Fish-key API calls). No deploy. |
| 2026-10-17 | tts-coverage-regen | **Closed the PARTIAL-coverage caveat from `tts-voices-port` → full premium voice coverage on `main`.** Adapted `scripts/tts-corpus.mts` to main's content schema: subject-keyed `CURRICULA` (iterate `Object.keys(CURRICULA)` — math/english/german/arabic/religion/social/science — instead of the tts branch's year-key `[1,2,3,4]`), dropped the `BOOKS_BY_ID` read-along + `buildSlideDeck`/slideshow sections (main has **neither** — those are tts-branch-only features), and kept **audioText-only** (main's only `speak()` call sites are `LessonScreen.speak(q.audioText)` + AudioBar replay/slow — no `targetText`, no battle speech). Corpus = **635 unique strings** (ar-EG 276 / de-DE 225 / en-GB 134), banks saturate cleanly (0 extra from the 600 hashed seeds). Measured vs manifest: **520/635 already clipped (82% overlap — the tts branch's corpus covered shared lessons)** → generated the **115 missing main-only clips** (92 ar-EG / 20 de-DE / 3 en-GB — e.g. German "Das Buch ist auf dem Stuhl" / "Herzlichen Glückwunsch zum Geburtstag!", English "This morning they watched the ducks.") via `generate-tts.mts`, `FISH_AUDIO_API_KEY` passed as a **process env var read from the sibling clone's `.env.local`** (this clone's `.env.local` only holds `VITE_GOOGLE_CLIENT_ID` — never committed either way): **115/115 ok, 0 failed** (every "retrying (net)" was rate-limit backoff that recovered). Manifest now **6,099 files / 148.44 MB**; `--check-manifest` → **coverage 635/635, exit 0**. Gotcha: `[System.IO.File]::ReadAllText('.env.local')` resolves against the **.NET cwd** (the session's `Default Project`), not PowerShell's `cd` — use absolute paths for env reads. Gates: `npx tsc -b` clean; full `npx vitest run` **100 files / 2650 green** (incl. `ttsPremium.test.ts` 14). No deploy. |
| 2026-10-17 | WS23-battle-prizes | **Momo Battle prizes + surfaces (§13 WS23) — all additive (R0).** `cards.ts`: widened `source` to `'chest'\|'arcade'\|'battle'`, added `BATTLE_CARDS` (mecha-sonic/egg-dragoon/solaris — exclusive-tier, `source:'battle'`, unlock-only, **never chest pool**; ALL_CARDS 100→**103**) + `BATTLE_CARD_GOALS` (gym 4/8/13) + `BATTLE_CARD_BY_ID`. `store.ts`: `grantBattleCard` + `checkBattleCards` (mirror the arcade pair; unlock = `battleCleared.includes(gym)`), `battleFinished` restructured to **return `ChestResult\|null`** and grant a first-clear **victory chest** (`rollChest(rng,'boss')` + existing `grantChest` as a NEW caller; optional `rng` for determinism) + re-check battle cards after the set; new `DAILY_RIVAL_BONUS_GEMS=1` (+1 on the once/day rematch win, gated by pre-roll `alreadyDoneToday` so a 2nd same-day rival win pays only repeat-win gems). Surfaces: **BattleDuel** victory-chest reveal + `dailyRival` prop; **BattleScreen** Daily Rival card (rematch vs your strongest cleared gym, once/day); **Profile** "Battle Road" stats card (trophies/wins/gyms `/13`); **Library** "Battle Exclusives" panel (locked art + goal + `Gyms n/m` progress); **App** threads the daily-rival flag. 3 placeholder webp tiles via ffmpeg drawtext (colon-free `fontfile=tmp/bf.ttf`; `-frames:v 1` — the `color` lavfi source loops forever without it). Fixed latent roster typo `egg-dragon`→`egg-dragoon` in `archetypes.ts`. Tests: cardStars/chestCards/arcadeCards bumped 100→**103**; new `battleCards.test.ts` (defs, goals, chest-pool exclusion, gym-4/8/13 unlocks, grant dedupe); store-battle extended (victory chest gem accounting `gems+dust`, daily-rival bonus/once-a-day/loss-retry). Gates: `tsc -b` clean; full vitest **101 files / 2662 green**; `npm run verify` OK. No deploy. |
| 2026-10-17 | WS24-r0-proof | **WS24 — R0 proof + regression (the user's rule, enforced).** New `tests/battle/ws24-proof.test.ts` (4 tests): seeds a realistic mid-game save (lessonProgress crowns, gems, cards, day keys pinned to `todayISO()` so `rollDay`/`rollWeek`/`markActivity` are same-day no-ops), runs a COMPLETE battle session (gym-1 first-clear win + deterministic victory chest via `rng:()=>0`, a gym-2 loss, a Daily-Rival rematch win, and a gym-4 milestone clear), then JSON-deep-diffs the whole store before/after. Hard guarantees: (1) `lessonProgress`/`lessonsToday`/`lessonsTodayDay` are byte-identical — battles never touch crowns/lessons; (2) every changed key ⊆ an explicit ALLOWED set = the 7 battle fields + the approved first-clear chest/XP path (`gems`/`xpTotal`/`todayXp`/`weeklyXp`/`cardStars`/`cardPity`/`cardsWonWeek`/`cardsWonWeekKey`) + same-day activity (`lastActiveDay`/`activityDays`) — any other mover FAILS the test; (3) the battle fields themselves DO progress (proves the session ran); (4) a milestone clear grants its card without mutating lesson mastery. Gotcha: there is **no** lifetime `cardsWon` field — the real names are `cardsWonWeek` + `cardsWonWeekKey` (`bumpCardsWon` returns only those two). Regression: `tsc -b` clean; full vitest **102 files / 2666 green**; `npm run verify` OK. No deploy. |
| 2026-10-18 | WS25-polish | **WS25 — final polish; §13 COMPLETE (WS17–WS25 all `[x]`, the only unchecked box left in PLAN.md ticked).** A11y: squad-pick toggles `aria-pressed` + `aria-label`; victory-chest reveal + result stage `role="status"` (`aria-live="polite"` on the stage); decorative emoji `aria-hidden`; HP bars confirmed colorblind-safe (`hp/max` text + bar width, never color alone). Reduced motion honored (global `@media (prefers-reduced-motion: reduce)` + `MotionConfig reducedMotion="user"` in BattleDuel). Live Edge smoke (dev :3200, seeded `battleCleared:[1,2,3]`) — **found + fixed a real copy bug**: the Daily Rival line rendered the literal `#{rivalDef.index}` (missing `$` in the template literal) → now `Rematch #3 for an extra gem today!`; badge spacing (`+1 💎 bonus`) made explicit after the villain name. Surfaces verified: Daily Rival card, Library "Battle Exclusives" 0/3 (per-card goal + `Gyms n/m`), Profile "Battle Road" (🏆 3 / ⚔️ 5 / 🗺️ 3/13), all 3 battle webps load (naturalWidth 300), console **0 errors / 0 warnings**. Offline: `npm run build` → `vite preview` smoke (root 200 / hashed JS 200 / `cards/mecha-sonic.webp` 200, 3050 B); sw.js cache-first handles the new webps on first view — no precache change needed. Bundle hygiene: measured **975 KB raw / 301 KB gzip** single chunk → decided NOT to lazy-split battle ("if needed" = not needed: all screens share the chunk by architecture, and a lazy chunk never fetched before going offline would break the offline-first battle tab) — evidence recorded. Also repaired a local-only (gitignored, untracked) `.env.local` corruption where the Fish key had been concatenated onto the `VITE_GOOGLE_CLIENT_ID` value with no newline (broke dev GSI sign-in + sent the polluted id to Google) — newline inserted, both keys parse cleanly, nothing committed. Gates: `tsc -b` clean; full vitest **102 files / 2666 green**; `npm run verify` OK. No deploy. |
