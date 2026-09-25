import { describe, expect, it } from 'vitest'
import { ENGLISH_BOOKS, BOOKS_BY_ID, BOOKS_BY_UNIT } from '../../src/content/english/books'
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
