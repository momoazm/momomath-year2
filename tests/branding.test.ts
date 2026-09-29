import { describe, expect, it } from 'vitest'
import {
  documentTitleFor,
  roadmapFooterFor,
  welcomeHeadingFor,
} from '../src/engine/branding'

/** PLAN Phase 31 step 166 — year-aware headings + year-neutral meta. */

describe('PLAN 166 — welcomeHeadingFor', () => {
  it('Year 2 keeps the shipped string byte-for-byte (verify-live marker)', () => {
    expect(welcomeHeadingFor(2)).toBe('Welcome to Momo Year 2 Cambridge!')
  })

  it('welcome heading switches only the year number', () => {
    expect(welcomeHeadingFor(1)).toBe('Welcome to Momo Year 1 Cambridge!')
    expect(welcomeHeadingFor(3)).toBe('Welcome to Momo Year 3 Cambridge!')
    expect(welcomeHeadingFor(4)).toBe('Welcome to Momo Year 4 Cambridge!')
  })
})

describe('PLAN 166 — roadmapFooterFor', () => {
  it('Year 2 keeps the shipped string byte-for-byte (pw-extras marker)', () => {
    expect(roadmapFooterFor(2, 'Maths', 57)).toBe('Momo Year 2 Cambridge · Maths · 57 lessons')
    expect(roadmapFooterFor(2, 'Deutsch (extra)', 42)).toBe(
      'Momo Year 2 Cambridge · Deutsch (extra) · 42 lessons',
    )
  })

  it('other years switch the number only', () => {
    expect(roadmapFooterFor(1, 'Maths', 30)).toBe('Momo Year 1 Cambridge · Maths · 30 lessons')
    expect(roadmapFooterFor(3, 'Science', 28)).toBe('Momo Year 3 Cambridge · Science · 28 lessons')
    expect(roadmapFooterFor(4, 'English', 44)).toBe('Momo Year 4 Cambridge · English · 44 lessons')
  })
})

describe('PLAN 166 — helpers stay consistent with documentTitleFor', () => {
  it('every heading family carries the same year number as the title', () => {
    for (const year of [1, 2, 3, 4] as const) {
      expect(documentTitleFor(year)).toContain(`Momo Year ${year} Cambridge`)
      expect(welcomeHeadingFor(year)).toContain(`Momo Year ${year} Cambridge`)
      expect(roadmapFooterFor(year, 'Maths', 1)).toContain(`Momo Year ${year} Cambridge`)
    }
  })
})
