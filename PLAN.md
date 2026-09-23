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
   3. ⬜ **Flashcard Sprint** exercise (roadmap catalogue #9) —
      **deferred 2026-09-23** (confirmed still deferred): needs a new
      timed rapid-fire UI mode in
      `LessonScreen` (that file also carries the parallel chat's chest
      rework — high regression risk for marginal fluency gain); exception-
      word rapid recognition is already drilled by e4l5 letter-tiles +
      mcq. Revisit as a pure-content sprint (mcq bank, no new kind) if
      the audit asks for it.
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
  ⬜ LLM follow-up question generation, ⬜ re-fit BKT params from real
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

**Status (2026-09-23)**: SHIPPED — full **100-card** roster below (+2:
`maria` common, `chao` rare; free sonic.fandom.com art). **Tier ladder is
LOCKED to the existing 5 tiers** (common | rare | epic | legendary |
exclusive) — user decision 2026-09-23: **no uncommon/mythic tiers**. All 100
rows ✅ (art on disk, free-source WS3/WS100 pipeline; image = `cards/<id>.webp`).
Distribution: **41 common / 26 rare / 18 epic / 10 legendary / 5 exclusive =
100**. All art sourced free (no paid services).

### Common (41) — ✅41 shipped

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
| 15 | bean | Bean the Dynamite | Bombs away! | cards/bean.webp | ✅ |
| 16 | bark | Bark the Polar Bear | Small polar bear, huge punch! | cards/bark.webp | ✅ |
| 17 | trip | Trip the Cat | The cat with goggles! | cards/trip.webp | ✅ |
| 18 | movie-stone | Agent Stone | Loyal to the last mustache! | cards/movie-stone.webp | ✅ |
| 19 | classic-tails | Classic Tails | The 1992 sidekick! | cards/classic-tails.webp | ✅ |
| 20 | classic-knuckles | Classic Knuckles | Punch first, guard later! | cards/classic-knuckles.webp | ✅ |
| 21 | classic-amy | Classic Amy | Pigtail-powered hammer! | cards/classic-amy.webp | ✅ |
| 22 | classic-eggman | Classic Eggman | The original mustache! | cards/classic-eggman.webp | ✅ |
| 23 | boom-sonic | Boom Sonic | Bigger attitude, bigger banter! | cards/boom-sonic.webp | ✅ |
| 24 | boom-tails | Boom Tails | DIY gadgets and sarcasm! | cards/boom-tails.webp | ✅ |
| 25 | boom-knuckles | Boom Knuckles | Strong, proud, easily tricked! | cards/boom-knuckles.webp | ✅ |
| 26 | boom-amy | Boom Amy | Nerf-charging hammer time! | cards/boom-amy.webp | ✅ |
| 27 | boom-eggman | Boom Eggman | Trapped in his own sitcom! | cards/boom-eggman.webp | ✅ |
| 28 | orbot | Orbot | The smart red sphere! | cards/orbot.webp | ✅ |
| 29 | cubot | Cubot | The (mostly) working cube! | cards/cubot.webp | ✅ |
| 30 | egg-robo | Egg-Robo | Clockwork helper gone rogue! | cards/egg-robo.webp | ✅ |
| 31 | motobug | Motobug | Vroom vroom — watch out! | cards/motobug.webp | ✅ |
| 32 | crabmeat | Crabmeat | Sideways snapper! | cards/crabmeat.webp | ✅ |
| 33 | buzz-bomber | Buzz Bomber | Sting in a jetpack! | cards/buzz-bomber.webp | ✅ |
| 34 | chopper | Chopper | Jumping fish alert! | cards/chopper.webp | ✅ |
| 35 | egg-pawn | Egg Pawn | Eggman's foot soldier! | cards/egg-pawn.webp | ✅ |
| 36 | zazz | Zazz the Zeti | Zeti of pure chaos! | cards/zazz.webp | ✅ |
| 37 | zomom | Zomom the Zeti | Hungry for trouble! | cards/zomom.webp | ✅ |
| 38 | zor | Zor the Zeti | Lazy but lethal! | cards/zor.webp | ✅ |
| 39 | zeena | Zeena the Zeti | Queen of attitude! | cards/zeena.webp | ✅ |
| 40 | master-zik | Master Zik | Old master, new mischief! | cards/master-zik.webp | ✅ |
| 41 | maria | Maria | A gentle friend from the ark! | cards/maria.webp | ✅ |

### Rare (26) — ✅26 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 41 | knuckles | Knuckles | The master of the fist! | cards/knuckles.webp | ✅ |
| 42 | blaze | Blaze | Faster than the fire! | cards/blaze.webp | ✅ |
| 43 | rouge | Rouge | A jewel thief with style! | cards/rouge.webp | ✅ |
| 44 | ray | Ray the Flying Squirrel | Glide through the sky! | cards/ray.webp | ✅ |
| 45 | vector | Vector the Crocodile | A loud, loveable leader! | cards/vector.webp | ✅ |
| 46 | classic-sonic | Classic Sonic | The original 1991 hedgehog! | cards/classic-sonic.webp | ✅ |
| 47 | werehog-sonic | Werehog Sonic | Big fists when the sun goes down! | cards/werehog-sonic.webp | ✅ |
| 48 | movie-knuckles | Movie Knuckles | Honorable fists, movie punch! | cards/movie-knuckles.webp | ✅ |
| 49 | wave | Wave the Swallow | Gearhead of the Babylon Rogues! | cards/wave.webp | ✅ |
| 50 | storm | Storm the Albatross | The sky's heavy hitter! | cards/storm.webp | ✅ |
| 51 | fang | Fang the Sniper | Corkscrew-wielding rival! | cards/fang.webp | ✅ |
| 52 | mighty | Mighty the Armadillo | Shell-shocked and sturdy! | cards/mighty.webp | ✅ |
| 53 | faker | Faker Sonic | A fake blue imposter! | cards/faker.webp | ✅ |
| 54 | metal-knuckles | Metal Knuckles | Chrome-plated puncher! | cards/metal-knuckles.webp | ✅ |
| 55 | tails-doll | Tails Doll | Not as cute as he looks! | cards/tails-doll.webp | ✅ |
| 56 | tikal | Tikal | Keeper of the emeralds' peace! | cards/tikal.webp | ✅ |
| 57 | whisper | Whisper the Wolf | Quiet, precise, deadly! | cards/whisper.webp | ✅ |
| 58 | surge | Surge the Tenrec | Electric troublemaker! | cards/surge.webp | ✅ |
| 59 | kit | Kit the Fennec | Loyal to a fault! | cards/kit.webp | ✅ |
| 60 | sally | Sally Acorn | Team leader with a plan! | cards/sally.webp | ✅ |
| 61 | movie-amy | Movie Amy | Hammer swing, big entrance! | cards/movie-amy.webp | ✅ |
| 62 | movie-eggman | Movie Eggman | Showman villain, big goggles! | cards/movie-eggman.webp | ✅ |
| 63 | gamma | E-102 Gamma | Robot with a heart of gold! | cards/gamma.webp | ✅ |
| 64 | heavy-king | Heavy King | The Mania kingpin! | cards/heavy-king.webp | ✅ |
| 65 | heavy-magician | Heavy Magician | Tricks up every sleeve! | cards/heavy-magician.webp | ✅ |
| 66 | chao | Chao | A tiny friend with a big heart! | cards/chao.webp | ✅ |

### Epic (18) — ✅18 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 66 | shadow | Shadow | The ultimate lifeform! | cards/shadow.webp | ✅ |
| 67 | silver | Silver | Psychic power of the future! | cards/silver.webp | ✅ |
| 68 | metal | Metal Sonic | A copy built to win! | cards/metal.webp | ✅ |
| 69 | espio | Espio the Chameleon | Master of disguise! | cards/espio.webp | ✅ |
| 70 | omega | Omega | The ultimate E-Series robot! | cards/omega.webp | ✅ |
| 71 | movie-sonic | Movie Sonic | Gotta go fast on the big screen! | cards/movie-sonic.webp | ✅ |
| 72 | movie-shadow | Movie Shadow | Shadow hits the silver screen! | cards/movie-shadow.webp | ✅ |
| 73 | neo-metal | Neo Metal Sonic | Metal evolved — now with attitude! | cards/neo-metal.webp | ✅ |
| 74 | dark-sonic | Dark Sonic | Anger made him faster! | cards/dark-sonic.webp | ✅ |
| 75 | mephiles | Mephiles the Dark | Shadow's darkest reflection! | cards/mephiles.webp | ✅ |
| 76 | infinite | Infinite | Fear is his weapon! | cards/infinite.webp | ✅ |
| 77 | zavok | Zavok the Zeti | Leader of the Deadly Six! | cards/zavok.webp | ✅ |
| 78 | sage | Sage | The digital daughter of Eggman! | cards/sage.webp | ✅ |
| 79 | chaos | Chaos | Guardian of the chao, uncontrollable! | cards/chaos.webp | ✅ |
| 80 | eggman-nega | Eggman Nega | From a future of endless schemes! | cards/eggman-nega.webp | ✅ |
| 81 | black-doom | Black Doom | The black arm's warlord! | cards/black-doom.webp | ✅ |
| 82 | erazor-djinn | Erazor Djinn | A lamp thief with a grudge! | cards/erazor-djinn.webp | ✅ |
| 83 | king-arthur | King Arthur | Ruler of the foggy realm! | cards/king-arthur.webp | ✅ |

### Legendary (10) — ✅10 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 84 | sonic | Sonic | The fastest thing alive! | cards/sonic.webp | ✅ |
| 85 | jet | Jet the Hawk | King of the Babylon Rogues! | cards/jet.webp | ✅ |
| 86 | super-shadow | Super Shadow | Chaos energy, golden glow! | cards/super-shadow.webp | ✅ |
| 87 | hyper-sonic | Hyper Sonic | Super power plus all seven emeralds! | cards/hyper-sonic.webp | ✅ |
| 88 | hyper-shadow | Hyper Shadow | Ultimate power, ultimate glow! | cards/hyper-shadow.webp | ✅ |
| 89 | excalibur-sonic | Excalibur Sonic | Knight of the golden sword! | cards/excalibur-sonic.webp | ✅ |
| 90 | super-knuckles | Super Knuckles | Glowing fists, tunnel vision! | cards/super-knuckles.webp | ✅ |
| 91 | super-blaze | Super Blaze | Burning brighter than before! | cards/super-blaze.webp | ✅ |
| 92 | devil-doom | Devil Doom | The black arm's final form! | cards/devil-doom.webp | ✅ |
| 93 | time-eater | Time Eater | Eats history for breakfast! | cards/time-eater.webp | ✅ |

### Exclusive (5) — ✅5 shipped

| # | id | name | flavor | image | art |
|---|----|------|--------|-------|-----|
| 94 | eggman | Dr. Eggman | The mad scientist of mayhem! | cards/eggman.webp | ✅ |
| 95 | super | Super Sonic | The legendary golden form! | cards/super-sonic.webp | ✅ |
| 96 | metal-overlord | Metal Overlord | Metal Sonic's ultimate evolution! | cards/metal-overlord.webp | ✅ |
| 97 | perfect-chaos | Perfect Chaos | A tsunami with a grudge! | cards/perfect-chaos.webp | ✅ |
| 98 | dark-gaia | Dark Gaia | The night itself awakened! | cards/dark-gaia.webp | ✅ |

**Totals**: 100 cards · 100 shipped (art on disk, all free sources) · 0 pending.
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

**Deferred unchanged**: Flashcard Sprint, audio-mcq/dictation kinds, adaptive
tail / per-difficulty ranges / LLM follow-ups, Monte-Carlo drop sim.

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
