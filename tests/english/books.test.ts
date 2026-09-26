import { describe, expect, it } from 'vitest'
import { ENGLISH_BOOKS, BOOKS_BY_ID, BOOKS_BY_UNIT } from '../../src/content/english/books'
import { CLASSIC_BOOKS } from '../../src/content/english/classic'
import { ENGLISH_UNITS, ENGLISH_ALL_LESSONS } from '../../src/content/english'
import { TEACH } from '../../src/content/english/teach'

describe('English unit storybooks (PLAN 15)', () => {
  it('covers every English unit exactly once with unique ids', () => {
    expect(ENGLISH_BOOKS).toHaveLength(ENGLISH_UNITS.length)
    expect(new Set(ENGLISH_BOOKS.map((b) => b.id)).size).toBe(ENGLISH_BOOKS.length)
    for (const u of ENGLISH_UNITS) {
      expect(u.book, `unit ${u.id} missing book`).toBeTruthy()
      expect(u.book!.unitId).toBe(u.id)
      expect(BOOKS_BY_UNIT[u.id]).toBe(u.book)
      expect(BOOKS_BY_ID[u.book!.id]).toBe(u.book)
    }
  })

  it('every book has 5-10 well-formed pages', () => {
    for (const b of ENGLISH_BOOKS) {
      expect(b.pages.length, `${b.id} page count`).toBeGreaterThanOrEqual(5)
      expect(b.pages.length, `${b.id} page count`).toBeLessThanOrEqual(10)
      expect(b.title.length).toBeGreaterThan(0)
      for (const p of b.pages) {
        expect(p.text.trim().length, `${b.id} page text`).toBeGreaterThan(0)
        expect(p.scene.length, `${b.id} page scene`).toBeGreaterThan(0)
        if (p.focus !== undefined) expect(p.focus.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

describe('Book comprehension quizzes (PLAN 96-98)', () => {
  it('every unit book has 3 valid questions: 2-4 distinct choices + in-range answer', () => {
    for (const b of ENGLISH_BOOKS) {
      expect(b.questions?.length, `${b.id} quiz length`).toBe(3)
      for (const [qi, q] of (b.questions ?? []).entries()) {
        expect(q.kind).toBe('mcq')
        expect(q.prompt.trim().length, `${b.id} q${qi} prompt`).toBeGreaterThan(0)
        expect(q.choices.length, `${b.id} q${qi} choice count`).toBeGreaterThanOrEqual(2)
        expect(q.choices.length, `${b.id} q${qi} choice count`).toBeLessThanOrEqual(4)
        expect(new Set(q.choices.map((c) => c.trim().toLowerCase())).size, `${b.id} q${qi} distinct`).toBe(q.choices.length)
        expect(q.answerIndex, `${b.id} q${qi} answer range`).toBeGreaterThanOrEqual(0)
        expect(q.answerIndex, `${b.id} q${qi} answer range`).toBeLessThan(q.choices.length)
        expect(q.choices[q.answerIndex].trim().length, `${b.id} q${qi} answer text`).toBeGreaterThan(0)
      }
    }
  })

  it('quiz answers actually match their story (spot-check one question per book)', () => {
    const expected: Record<string, number> = {
      'bk-e1': 0, 'bk-e2': 1, 'bk-e3': 0, 'bk-e4': 1, 'bk-e5': 0, 'bk-e6': 0, 'bk-e7': 1,
      'bk-e8': 0, 'bk-e9': 2, 'bk-e10': 0, 'bk-e11': 0, 'bk-e12': 1, 'bk-e13': 0,
    }
    for (const b of ENGLISH_BOOKS) {
      expect(b.questions?.[0].answerIndex, `${b.id} q0`).toBe(expected[b.id])
    }
    // spot-texts: the canonical answer word must appear on some page
    const textOf = (id: string) => ENGLISH_BOOKS.find((b) => b.id === id)!.pages.map((p) => p.text).join(' ')
    expect(textOf('bk-e1')).toContain('sss')
    expect(textOf('bk-e2')).toContain('cape')
    expect(textOf('bk-e5')).toContain('enormous')
    expect(textOf('bk-e8')).toContain('played')
  })
})

describe('Classic public-domain storybooks (PLAN 99-100)', () => {
  it('has 6 classics with 6 pages + 3 valid questions each, registered by id', () => {
    expect(CLASSIC_BOOKS).toHaveLength(6)
    expect(new Set(CLASSIC_BOOKS.map((b) => b.id)).size).toBe(6)
    for (const b of CLASSIC_BOOKS) {
      expect(b.pages.length, `${b.id} pages`).toBe(6)
      expect(b.questions?.length, `${b.id} quiz`).toBe(3)
      expect(BOOKS_BY_ID[b.id], `${b.id} registered`).toBe(b)
      for (const p of b.pages) {
        expect(p.text.trim().length, `${b.id} page`).toBeGreaterThan(0)
        expect(p.scene.length, `${b.id} scene`).toBeGreaterThan(0)
      }
      for (const [qi, q] of (b.questions ?? []).entries()) {
        expect(q.choices.length, `${b.id} q${qi} choices`).toBe(3)
        expect(new Set(q.choices).size, `${b.id} q${qi} distinct`).toBe(3)
        expect(q.answerIndex, `${b.id} q${qi} range`).toBeGreaterThanOrEqual(0)
        expect(q.answerIndex, `${b.id} q${qi} range`).toBeLessThan(3)
      }
    }
  })

  it('classics never replace a unit roadmap book', () => {
    for (const u of ENGLISH_UNITS) {
      expect(BOOKS_BY_UNIT[u.id]).toBe(u.book)
      expect(u.book!.id.startsWith('bk-')).toBe(true)
    }
  })
})

describe('English guide teach lines (PLAN 14)', () => {
  it('TEACH covers every lesson and boss id exactly', () => {
    const ids = Object.keys(ENGLISH_ALL_LESSONS)
    expect(ids.length).toBe(74)
    for (const id of ids) expect(TEACH[id], `missing TEACH for ${id}`).toBeTruthy()
    for (const id of Object.keys(TEACH)) expect(ENGLISH_ALL_LESSONS[id], `stray TEACH id ${id}`).toBeTruthy()
  })

  it('every teach line is short and non-empty (<=12 words)', () => {
    for (const [id, lines] of Object.entries(TEACH)) {
      expect(lines.length, id).toBeGreaterThanOrEqual(2)
      expect(lines.length, id).toBeLessThanOrEqual(3)
      for (const line of lines) {
        expect(line.trim().length, `${id}: ${line}`).toBeGreaterThan(0)
        expect(line.trim().split(/\s+/).length, `${id}: ${line}`).toBeLessThanOrEqual(12)
      }
    }
  })

  it('lessons carry hydrated teach arrays at runtime', () => {
    for (const id of Object.keys(ENGLISH_ALL_LESSONS)) {
      expect(ENGLISH_ALL_LESSONS[id].lesson.teach, id).toEqual(TEACH[id])
    }
  })
})
