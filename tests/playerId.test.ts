import { describe, expect, it } from 'vitest'
import { guestIdFromName } from '../src/engine/playerId'

// PLAN step 141: every year2 API whitelists `^[\w:-]+$` in playerIds. Names
// that previously worked must keep their exact id (no lost friendships); names
// that previously 400'd must now produce an accepted id.

describe('guestIdFromName', () => {
  it('keeps ids that already passed the server whitelist', () => {
    expect(guestIdFromName('ahmed')).toBe('name:ahmed')
    expect(guestIdFromName('Ahmed')).toBe('name:ahmed')
    expect(guestIdFromName('super-kid')).toBe('name:super-kid')
    expect(guestIdFromName('a_b2')).toBe('name:a_b2')
    expect(guestIdFromName('Champion')).toBe('name:champion')
  })

  it('slugifies spaces (the common kid-name case)', () => {
    expect(guestIdFromName('Sarah Ali')).toBe('name:sarah_ali')
    expect(guestIdFromName('  Layla  M  ')).toBe('name:layla_m')
  })

  it('slugifies apostrophes, accents and emoji', () => {
    expect(guestIdFromName("O'Neil")).toBe('name:o_neil')
    expect(guestIdFromName('Jos\u00e9')).toBe('name:jos_')
    expect(guestIdFromName('sonic\u2b50')).toBe('name:sonic_')
  })

  it('collapses runs and never emits characters outside [\\w:-]', () => {
    const id = guestIdFromName('!! a ?? b!!')
    expect(id).toBe('name:_a_b_')
    expect(id).toMatch(/^name:[\w:-]+$/)
  })

  it('falls back for empty/whitespace names', () => {
    expect(guestIdFromName('')).toBe('name:champion')
    expect(guestIdFromName('   ')).toBe('name:champion')
  })

  it('is idempotent (client slug == server-normalized slug)', () => {
    for (const n of ['Sarah Ali', "O'Neil", 'sonic\u2b50', 'a  b']) {
      const once = guestIdFromName(n)
      expect(guestIdFromName(once.slice('name:'.length))).toBe(once)
    }
  })
})
