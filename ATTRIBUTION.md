# Enemy & boss image attribution

All images in `public/images/enemies/` are **official SEGA / Sonic the Hedgehog artwork**
found on the internet (Sonic Wiki / sonic.fandom.com file pages), fetched by
`scripts/fetch-enemy-images.mjs` (plus `scripts/fetch-transparent-pass.mjs` for
transparent-background re-fetches). Used under the user's 2026-09-23 amendment to the
PLAN.md IP note (official images allowed for enemies/bosses in this free, non-commercial
fangame). © SEGA / Sonic Team. Sonic the Hedgehog is a trademark of SEGA Corporation.

The player sprite `public/images/players/sonic.webp` (full-body, transparent) is also
official SEGA artwork from the same wiki, fetched by `scripts/fetch-player-art.mjs`;
sources recorded in `public/images/players/manifest.json`.

Source pages are recorded per image in `public/images/enemies/manifest.json`
(slug → wiki File page URL + original URL).

Note: `reused: true` entries share another badnik's art (no suitable official image was
findable for that name): driptooter/pengu-bot → Egg Pawn, jet-propn/krako → Aquis,
pata-bata → Swat-Bot, bomber-hawk → Buzzer.

This project remains free-only with no monetization (PLAN.md budget constraint).
Redistribution/publication of SEGA art is a copyright risk the project owner accepts.
