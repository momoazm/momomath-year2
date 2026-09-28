import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { trioVisible } from '../src/engine/unlock'
import { ProfileScreen } from '../src/screens/ProfileScreen'

/** PLAN Phase 31 step 162 — hidden trio visibility rules. */

/** Unique section markers (the trio's Profile card titles). */
const AR = 'العربية · Egyptian Grade 2'
const RE = 'التربية الدينية · Grade 2'
const SO = 'الدراسات · Grade 2'

describe('PLAN 162 — trioVisible rule', () => {
  it('Year 2 renders the trio when unlocked or the own flag is on', () => {
    expect(trioVisible(2, true, false)).toBe(true) // unlocked, not opted in yet
    expect(trioVisible(2, true, true)).toBe(true)
    expect(trioVisible(2, false, true)).toBe(true) // grandfathered flag
    expect(trioVisible(2, false, false)).toBe(false) // locked + no flag
  })

  it('every other year hides the trio, even fully unlocked', () => {
    for (const year of [1, 3, 4]) {
      expect(trioVisible(year, true, true)).toBe(false)
      expect(trioVisible(year, true, false)).toBe(false)
      expect(trioVisible(year, false, true)).toBe(false)
      expect(trioVisible(year, false, false)).toBe(false)
    }
  })
})

describe('PLAN 162 — default render (fresh install = Year 2, locked)', () => {
  it('shows the code box and hides all three trio cards', () => {
    // NOTE: zustand v5 server renders use the store's INITIAL state, which
    // here is exactly the fresh-install case — the other visibility branches
    // are covered by the trioVisible truth table above + the e2e probe.
    const html = renderToStaticMarkup(createElement(ProfileScreen))
    expect(html).toContain('data-testid="unlock-code-box"')
    expect(html).not.toContain(AR)
    expect(html).not.toContain(RE)
    expect(html).not.toContain(SO)
    expect(html).toContain('data-testid="year-chip"')
  })
})
