/**
 * Universal extras-unlock engine (PLAN 161).
 *
 * One code — `Farousy` — unlocks the hidden trio (Arabic / Religion /
 * Social Studies) for the active profile. It can be typed manually in the
 * Profile code box (Year 2 only) or pre-applied through the `?unlock=Farousy`
 * magic link, which validates, persists, celebrates and then clears the param.
 *
 * Pure + dependency-free so both the UI and tests share one validator.
 */

/** The universal extras-unlock code (shared with parents / magic links). */
export const EXTRAS_UNLOCK_CODE = 'Farousy'

/** Trimmed, case-insensitive validation of a user-entered code or ?unlock= value. */
export function validate(code: string | null | undefined): boolean {
  if (typeof code !== 'string') return false
  return code.trim().toLowerCase() === EXTRAS_UNLOCK_CODE.toLowerCase()
}

/** Read + validate the `?unlock=` deep-link param from a location.search string. */
export function readUnlockParam(search: string): boolean {
  try {
    return validate(new URLSearchParams(search).get('unlock'))
  } catch {
    return false
  }
}
