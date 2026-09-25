import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildCheckup,
  CHECKUP_DUE_MAX,
  CHECKUP_SIZE,
  CHECKUP_WRONG_MAX,
  dueSkillCodes,
} from '../../src/engine/adaptive/checkup'
import { buildCatalog } from '../../src/engine/adaptive/catalog'
import { buildAttemptEntry, newSkillState } from '../../src/engine/adaptive/model'
import { questionFingerprint } from '../../src/content/makeLesson'
import type {
  AdaptiveSnapshot,
  AttemptLogEntry,
  SkillState,
} from '../../src/engine/adaptive/types'
import type { Question } from '../../src/content/types'

const NOW = 1_700_000_000_000
const DAY = 86_400_000

function emptySnap(): AdaptiveSnapshot {
  return { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null }
}

function skill(over: Partial<SkillState>): SkillState {
  return { ...newSkillState(NOW), ...over }
}

/** due = last practiced 40 days ago (past every review band, max 30d). */
function dueSkill(over: Partial<SkillState> = {}): SkillState {
  return skill({ lastPracticedAt: NOW - 40 * DAY, ...over })
}

function snapWith(codes: string[], make: (code: string) => SkillState): AdaptiveSnapshot {
  const snap = emptySnap()
  for (const code of codes) snap.skills[code] = make(code)
  return snap
}

function wrongEntry(q: Question, over: Partial<AttemptLogEntry> = {}): AttemptLogEntry {
  return buildAttemptEntry({
    lessonId: 'u1l1',
    objectiveCode: '2Nc.01',
    kind: 'mcq',
    difficulty: 1,
    answer: 'x',
    correct: false,
    responseTimeMs: 4000,
    masteryBefore: 0.3,
    masteryAfter: 0.2,
    reason: 'mastery-deficit',
    ts: 1_000,
    prompt: 'missed one',
    correctAnswer: 'y',
    q,
    ...over,
  })
}

function mcq(prompt: string): Question {
  return { kind: 'mcq', prompt, choices: ['a', 'b'], answerIndex: 0 }
}

function fps(items: { question: Question }[]): string[] {
  return items.map((i) => questionFingerprint(i.question))
}

// Real, catalogued codes across subjects — the check-up spans all 7.
const MATH_CODE = '2Nc.01'
const SCIENCE_CODE = '2TWSc.04'
const ENGLISH_CODE = '2Rw.01'
const GERMAN_CODE = '4Sc.01'

describe('dueSkillCodes', () => {
  it('uses real catalogued codes across subjects', () => {
    for (const [subject, code] of [
      ['math', MATH_CODE],
      ['science', SCIENCE_CODE],
      ['english', ENGLISH_CODE],
      ['german', GERMAN_CODE],
    ] as const) {
      expect(buildCatalog(subject).map((e) => e.code)).toContain(code)
    }
  })

  it('returns every due skill across subjects, most overdue first', () => {
    const snap = snapWith([MATH_CODE, SCIENCE_CODE, ENGLISH_CODE, GERMAN_CODE], () =>
      dueSkill({ lastPracticedAt: NOW - 40 * DAY }),
    )
    expect(dueSkillCodes(snap, NOW)).toHaveLength(4)
    // one even more overdue sorts first
    snap.skills[SCIENCE_CODE] = dueSkill({ lastPracticedAt: NOW - 90 * DAY })
    expect(dueSkillCodes(snap, NOW)[0]).toBe(SCIENCE_CODE)
  })

  it('excludes cold skills and skills not yet due', () => {
    const snap = snapWith(['cold', 'fresh', 'due'], (code) => {
      if (code === 'cold') return skill({ lastPracticedAt: 0 })
      if (code === 'fresh') return skill({ lastPracticedAt: NOW - 60_000, pL: 0.99 })
      return dueSkill()
    })
    expect(dueSkillCodes(snap, NOW)).toEqual(['due'])
  })

  it('is deterministic regardless of skill insertion order', () => {
    const codes = [MATH_CODE, SCIENCE_CODE, ENGLISH_CODE, GERMAN_CODE]
    const a = emptySnap()
    for (const c of codes) a.skills[c] = dueSkill()
    const b = emptySnap()
    for (const c of [...codes].reverse()) b.skills[c] = dueSkill()
    expect(dueSkillCodes(a, NOW)).toEqual(dueSkillCodes(b, NOW))
    // exact tie on lastPracticedAt → objective code breaks it, not object order
    // ('2Nc.01' < '2Rw.01' < '2TWSc.04' < '4Sc.01')
    expect(dueSkillCodes(a, NOW)).toEqual([MATH_CODE, ENGLISH_CODE, SCIENCE_CODE, GERMAN_CODE])
  })
})

describe('buildCheckup composition', () => {
  it('interleaves due-skill items with wrong-question snapshots, due first', () => {
    const snap = snapWith([MATH_CODE, SCIENCE_CODE, ENGLISH_CODE], () => dueSkill())
    const attempts = [
      wrongEntry(mcq('miss A'), { ts: 10 }),
      wrongEntry(mcq('miss B'), { ts: 11 }),
      wrongEntry(mcq('miss C'), { ts: 12 }),
    ]
    const s = buildCheckup({ snap, attempts, now: NOW, seed: 7 })
    expect(s.items.length).toBeLessThanOrEqual(CHECKUP_SIZE)
    expect(s.items.length).toBe(3 + 3)
    expect(s.dueCodes).toHaveLength(3)
    expect(s.wrongCount).toBe(3)
    // due first, then a wrong one, alternating; wrongs come newest-first
    expect(s.items[0]!.objectiveCode).toBe(MATH_CODE)
    expect(s.items[1]!.question).toEqual(mcq('miss C'))
    expect(s.items[2]!.objectiveCode).toBe(ENGLISH_CODE)
    expect(s.items[3]!.question).toEqual(mcq('miss B'))
    expect(s.items[4]!.objectiveCode).toBe(SCIENCE_CODE)
    expect(s.items[5]!.question).toEqual(mcq('miss A'))
    // fingerprints never repeat within a round
    const prints = fps(s.items)
    expect(new Set(prints).size).toBe(prints.length)
  })

  it('caps due codes, pulls at most CHECKUP_WRONG_MAX wrongs, fills CHECKUP_SIZE', () => {
    const real = [
      ...new Set([
        ...buildCatalog('math').slice(0, 4).map((e) => e.code),
        ...buildCatalog('science').slice(0, 4).map((e) => e.code),
        ...buildCatalog('english').slice(0, 4).map((e) => e.code),
      ]),
    ]
    expect(real.length).toBeGreaterThanOrEqual(8)
    const snap = snapWith(real, () => dueSkill())
    const attempts = Array.from({ length: 9 }, (_, i) =>
      wrongEntry(mcq(`miss ${i}`), { ts: 100 + i }),
    )
    const s = buildCheckup({ snap, attempts, now: NOW, seed: 1 })
    expect(s.dueCodes).toHaveLength(CHECKUP_DUE_MAX)
    expect(s.items).toHaveLength(CHECKUP_SIZE)
    expect(s.wrongCount).toBeLessThanOrEqual(CHECKUP_WRONG_MAX)
    const prints = fps(s.items)
    expect(new Set(prints).size).toBe(prints.length)
  })

  it('keeps wrong items as exact snapshots from the log', () => {
    const q = mcq('the exact miss')
    const s = buildCheckup({ snap: emptySnap(), attempts: [wrongEntry(q)], now: NOW, seed: 1 })
    expect(s.items).toHaveLength(1)
    expect(s.items[0]!.question).toEqual(q)
    expect(s.items[0]!.lessonId).toBe('u1l1')
    expect(s.items[0]!.objectiveCode).toBe('2Nc.01')
    expect(s.wrongCount).toBe(1)
  })

  it('collapses duplicate fingerprints (same miss logged twice)', () => {
    const q = mcq('same miss')
    const attempts = [wrongEntry(q, { ts: 1 }), wrongEntry({ ...q }, { ts: 2 })]
    const s = buildCheckup({ snap: emptySnap(), attempts, now: NOW, seed: 1 })
    expect(s.items).toHaveLength(1)
  })

  it('returns an empty session when there is nothing to check', () => {
    const s = buildCheckup({ snap: emptySnap(), attempts: [], now: NOW, seed: 1 })
    expect(s.items).toEqual([])
    expect(s.dueCodes).toEqual([])
    expect(s.wrongCount).toBe(0)
  })

  it('skips due codes whose lesson no longer exists', () => {
    const snap = snapWith(['ZZz.99', MATH_CODE], () => dueSkill())
    const s = buildCheckup({ snap, attempts: [], now: NOW, seed: 1 })
    expect(s.dueCodes).toHaveLength(2)
    expect(s.items).toHaveLength(1)
    expect(s.items[0]!.objectiveCode).toBe(MATH_CODE)
  })

  it('honours the target length', () => {
    const snap = snapWith([MATH_CODE, SCIENCE_CODE, ENGLISH_CODE, GERMAN_CODE], () => dueSkill())
    const attempts = Array.from({ length: 5 }, (_, i) => wrongEntry(mcq(`m${i}`), { ts: i }))
    const s = buildCheckup({ snap, attempts, now: NOW, seed: 3, target: 5 })
    expect(s.items).toHaveLength(5)
  })
})

describe('buildCheckup determinism', () => {
  it('same inputs + seed → identical round', () => {
    const snap = snapWith([MATH_CODE, SCIENCE_CODE, ENGLISH_CODE], () => dueSkill())
    const attempts = [wrongEntry(mcq('miss A'))]
    const a = buildCheckup({ snap, attempts, now: NOW, seed: 42 })
    const b = buildCheckup({ snap, attempts, now: NOW, seed: 42 })
    expect(fps(a.items)).toEqual(fps(b.items))
  })

  it('default seed is the day number (stable within a day)', () => {
    const snap = snapWith([MATH_CODE], () => dueSkill())
    const a = buildCheckup({ snap, attempts: [], now: NOW })
    const b = buildCheckup({ snap, attempts: [], now: NOW + 3600_000 })
    expect(fps(a.items)).toEqual(fps(b.items))
    // tomorrow generates a fresh round but the same due set
    const tomorrow = buildCheckup({ snap, attempts: [], now: NOW + 2 * DAY })
    expect(tomorrow.dueCodes).toEqual(a.dueCodes)
    expect(fps(tomorrow.items)).not.toEqual(fps(a.items))
  })

  it('never mutates its inputs', () => {
    const snap = snapWith([MATH_CODE, SCIENCE_CODE], () => dueSkill())
    const attempts = [wrongEntry(mcq('miss A'))]
    const snapBefore = JSON.stringify(snap)
    const attemptsBefore = JSON.stringify(attempts)
    buildCheckup({ snap, attempts, now: NOW, seed: 5 })
    expect(JSON.stringify(snap)).toBe(snapBefore)
    expect(JSON.stringify(attempts)).toBe(attemptsBefore)
  })
})

/* ---------------- XP-only payout: recordPractice, the path every check-up
   session settles through, must move XP/dailies and nothing else. ------- */

describe('check-up payout is XP-only', () => {
  beforeEach(async () => {
    const { usePlayer } = await import('../../src/engine/store')
    const { ACHIEVEMENTS, todayISO } = await import('../../src/engine/gamification')
    const day = todayISO()
    usePlayer.setState({
      xpTotal: 100,
      gems: 50,
      todayXp: 10,
      todayXpDay: day,
      weeklyXp: 10,
      weeklyXpWeek: day,
      correctToday: 0,
      correctTodayDay: day,
      lessonsToday: 0,
      lessonsTodayDay: day,
      subjectsToday: [],
      subjectsTodayDay: day,
      lastActiveDay: day,
      streakCurrent: 3,
      streakLongest: 3,
      streakSavers: 0,
      lastStreakReward: 0,
      pendingStreakMilestone: null,
      lessonProgress: { u1l1: { crown: 2, bestAccuracy: 100, completions: 3 } },
      cardStars: { alpha: 3 },
      cardPity: 7,
      achievements: ACHIEVEMENTS.map((a) => a.id),
      doubleXpLessons: 0,
      arcadeCorrectToday: 5,
      arcadeCorrectTodayDay: day,
    })
  })

  it('moves XP/daily/weekly counters but never lessons, crowns, or cards', async () => {
    const { usePlayer } = await import('../../src/engine/store')
    const before = usePlayer.getState()
    usePlayer.getState().recordPractice({ xp: 20, correct: 8, totalQuestions: 10 })
    const after = usePlayer.getState()

    expect(after.xpTotal).toBe(before.xpTotal + 20)
    expect(after.todayXp).toBe(before.todayXp + 20)
    expect(after.weeklyXp).toBe(before.weeklyXp + 20)
    expect(after.gems).toBe(before.gems + Math.round(20 / 10))
    expect(after.correctToday).toBe(before.correctToday + 8)

    // XP-only: no lesson/crown/chest/arcade side effects.
    expect(after.lessonProgress).toEqual(before.lessonProgress)
    expect(after.lessonsToday).toBe(0)
    expect(after.cardStars).toEqual(before.cardStars)
    expect(after.cardPity).toBe(before.cardPity)
    expect(after.streakCurrent).toBe(before.streakCurrent)
    expect(after.pendingStreakMilestone).toBeNull()
    expect(after.arcadeCorrectToday).toBe(5)
    expect(after.achievements).toEqual(before.achievements)
  })
})
