# Prize-engine draft — archived 2026-08-26

Superseded standalone draft of the chest/prize system. Kept for reference only;
nothing here is imported by the app.

## Why it was archived
- It was built inside the WRONG repo: `Documents\Default Project\` (the
  momolearn.space / momolearn-ai Vercel repo), where it sat untracked.
- The shipped implementation lives in `src/engine/gamification.ts`
  (`LOOT_TABLE`, `rollChest`, `RARITY_META`) + `src/engine/shop.ts`, committed
  in `5c7ba42` after this draft was written.

## What it contains (design ideas worth remembering)
- Three chest tiers (wood/silver/gold) earned by play, never sold.
- Pity timers (rare+ within 10 opens, legendary within 50).
- Duplicate protection with below-shop-price gem refunds.
- Published exact odds via `getOdds()`; EV ordering machine-verified by
  `scripts/verify-chests.mjs` (37 checks) against `loot-tables.js`.
- jsonblob.com leaderboard sync draft (`leaderboard.ts`) — replaced by the
  Google sign-in leagues flow.

If the pity/duplicate-protection fairness rules are ever wanted for the live
game, port them into `gamification.ts` rather than reviving this folder.
