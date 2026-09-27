// Guest identity helper — the single source of truth for name-derived ids.
//
// The year2 APIs (friends + leaderboard) whitelist `[\w:-]` in playerIds, but
// kids type display names with spaces, apostrophes, accents or emoji. Building
// the id raw (`name:sarah ali`) made /friends/code, /friends/join, /friends/list
// and the leaderboard PUT all 400 for those players — no code, no join, no
// weekly XP sync (PLAN step 141). Slug the name identically on every screen so
// all callers agree, keeping the exact id for names that already worked (only
// names that were previously rejected ever change, and they never had data).

/** `Sarah Ali` -> `name:sarah_ali`; safe for the `^[\w:-]+$` server whitelist. */
export function guestIdFromName(name: string): string {
  const slug = (name.trim() || 'Champion').toLowerCase().replace(/[^\w:-]+/g, '_')
  return `name:${slug || 'champion'}`
}
