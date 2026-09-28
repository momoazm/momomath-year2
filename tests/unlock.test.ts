import { describe, expect, it } from 'vitest'
import { EXTRAS_UNLOCK_CODE, validate, readUnlockParam } from '../src/engine/unlock'
import { usePlayer } from '../src/engine/store'

/** PLAN Phase 31 step 161 — universal extras unlock. */
describe('PLAN 161 — extras unlock engine', () => {
  it('keeps the universal code', () => {
    expect(EXTRAS_UNLOCK_CODE).toBe('Farousy')
  })

  it('validates trimmed, case-insensitive codes only', () => {
    expect(validate('Farousy')).toBe(true)
    expect(validate('farousy')).toBe(true)
    expect(validate('  FAROUSY  ')).toBe(true)
    expect(validate('Farouzy')).toBe(false)
    expect(validate(' Farousy extra ')).toBe(false)
    expect(validate('')).toBe(false)
    expect(validate('   ')).toBe(false)
    expect(validate(null)).toBe(false)
    expect(validate(undefined)).toBe(false)
  })

  it('reads the ?unlock= magic-link param', () => {
    expect(readUnlockParam('?unlock=Farousy')).toBe(true)
    expect(readUnlockParam('?unlock=farousy&cb=1')).toBe(true)
    expect(readUnlockParam('?unlock=nope')).toBe(false)
    expect(readUnlockParam('?unlock=')).toBe(false)
    expect(readUnlockParam('?gate=2')).toBe(false)
    expect(readUnlockParam('')).toBe(false)
    expect(readUnlockParam('garbage%%')).toBe(false)
  })

  it('setExtrasUnlocked flips the flag and it stays shared across years', () => {
    const s = usePlayer.getState()
    expect(s.extrasUnlocked).toBe(false)
    s.setExtrasUnlocked(true)
    expect(usePlayer.getState().extrasUnlocked).toBe(true)
    // shared profile field — NOT part of the per-year bucket
    usePlayer.getState().setYearLevel(3)
    expect(usePlayer.getState().extrasUnlocked).toBe(true)
    usePlayer.getState().setYearLevel(2)
    expect(usePlayer.getState().extrasUnlocked).toBe(true)
    usePlayer.getState().setExtrasUnlocked(false)
    expect(usePlayer.getState().extrasUnlocked).toBe(false)
  })
})
