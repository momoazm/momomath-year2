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

/**
 * Fresh install identity (PLAN 141e): a random id that never follows the
 * display name, so renaming can't orphan friendships and two kids picking the
 * same name can't share one identity. `guest:xxxx` passes the same
 * `^[\w:-]+$` whitelist. Existing saves never call this — the v15 migration
 * freezes their current name-derived id instead (zero server-data orphaning).
 */
export function newGuestId(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return `guest:${out}`
}
