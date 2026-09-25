import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, DAILY_QUESTS, type AchievementSnapshot, type QuestSnapshot } from '../src/engine/gamification'

const snap = (over: Partial<QuestSnapshot> = {}): QuestSnapshot => ({
  xpToday: 0,
  lessonsToday: 0,
  correctToday: 0,
  subjectsToday: [],
  arcadeCorrectToday: 0,
  ...over,
})

describe('WS-§9 B2 multi-subject daily quests', () => {
  it('DAILY_QUESTS includes subject-spanning goals (not just XP/lessons/correct)', () => {
    const subjectQuests = DAILY_QUESTS.filter((q) => q.id === 'subjects2' || q.id === 'subjects3')
    expect(subjectQuests.length).toBe(2)
    for (const q of subjectQuests) {
      expect(q.goal).toBeGreaterThanOrEqual(2)
      expect(q.label(q.goal)).toMatch(/subject/i)
      expect(q.reward).toBeGreaterThanOrEqual(20)
    }
  })

  it('subjects2/subjects3 progress from subjectsToday length and start at 0', () => {
    const q2 = DAILY_QUESTS.find((q) => q.id === 'subjects2')!
    const q3 = DAILY_QUESTS.find((q) => q.id === 'subjects3')!
    expect(q2.progress(snap())).toBe(0)
    expect(q2.progress(snap({ subjectsToday: ['math', 'english'] }))).toBe(2)
    expect(q3.progress(snap({ subjectsToday: ['math', 'english'] }))).toBe(2)
    expect(q3.progress(snap({ subjectsToday: ['math', 'english', 'science'] }))).toBe(3)
  })

  it('original three quests still work', () => {
    const xp = DAILY_QUESTS.find((q) => q.id === 'xp20')!
    expect(xp.progress(snap({ xpToday: 20 }))).toBe(20)
    const lessons = DAILY_QUESTS.find((q) => q.id === 'lessons2')!
    expect(lessons.progress(snap({ lessonsToday: 1 }))).toBe(1)
    const correct = DAILY_QUESTS.find((q) => q.id === 'correct10')!
    expect(correct.progress(snap({ correctToday: 10 }))).toBe(10)
  })
})

describe('WS-§9 B2/B3 achievements album + multi-subject', () => {
  const base: AchievementSnapshot = {
    xpTotal: 0,
    streakCurrent: 0,
    lessonsCompleted: 0,
    crowns: 0,
    subjectCount: 0,
    cardsOwned: 0,
    arcadeBests: 0,
    arcadeTop: 0,
  }

  it('subject achievements unlock only at 3 / 5 distinct subjects', () => {
    const s3 = ACHIEVEMENTS.find((a) => a.id === 'subjects-3')!
    const s5 = ACHIEVEMENTS.find((a) => a.id === 'subjects-5')!
    expect(s3.test({ ...base, subjectCount: 2 })).toBe(false)
    expect(s3.test({ ...base, subjectCount: 3 })).toBe(true)
    expect(s5.test({ ...base, subjectCount: 4 })).toBe(false)
    expect(s5.test({ ...base, subjectCount: 5 })).toBe(true)
  })

  it('card album achievements unlock at 10 / 40 owned', () => {
    const c10 = ACHIEVEMENTS.find((a) => a.id === 'cards-10')!
    const c40 = ACHIEVEMENTS.find((a) => a.id === 'cards-40')!
    expect(c10.test({ ...base, cardsOwned: 9 })).toBe(false)
    expect(c10.test({ ...base, cardsOwned: 10 })).toBe(true)
    expect(c40.test({ ...base, cardsOwned: 39 })).toBe(false)
    expect(c40.test({ ...base, cardsOwned: 40 })).toBe(true)
  })

  it('every achievement has unique id and a non-empty desc', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const a of ACHIEVEMENTS) expect(a.desc.length).toBeGreaterThan(4)
  })
})
