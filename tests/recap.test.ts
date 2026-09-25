import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACTIVITY_DAYS_CAP,
  addActivityDay,
  buildMonthGrid,
  buildWeeklyRecap,
  mergeActivityDays,
  normaliseActivityDays,
} from '../src/engine/recap'
import { mergeCloudSave, snapshotFromPlayer, type CloudSave } from '../src/engine/cloudsave'
import { buildAttemptEntry } from '../src/engine/adaptive/model'
import { usePlayer } from '../src/engine/store'
import { ARCADE_CARDS, rollChest, type ChestResult } from '../src/engine/cards'
import { mulberry32 } from '../src/content/rng'
import type { AttemptLogEntry } from '../src/engine/adaptive/types'

/* ------------------------------------------------------------------ *
 * WS15 — activity calendar (day-roll) + cloudsave union + recap math  *
 * ------------------------------------------------------------------ */

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** `n` consecutive ASCENDING ISO days ending the day before `from`. */
function daysBefore(from: Date, n: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from)
    d.setDate(d.getDate() - (i + 1))
    out.push(isoOf(d))
  }
  return out
}

function save(overrides: Partial<CloudSave> = {}): CloudSave {
  return {
    name: 'Champion',
    mascot: 'sonic',
    subject: 'math',
    xpTotal: 100,
    gems: 50,
    streakCurrent: 3,
    streakLongest: 5,
    lastActiveDay: '2026-08-24',
    dailyGoal: 30,
    weeklyXpWeek: '2026-08-24',
    weeklyXp: 40,
    currentLeague: 'Bronze',
    leagueHistory: [],
    lessonProgress: {},
    achievements: [],
    cardStars: {},
    shopInventory: {},
    streakSavers: 0,
    doubleXpLessons: 0,
    luckyTickets: 0,
    adaptive: null,
    updatedAt: 1000,
    ...overrides,
  }
}

function attemptAt(ts: number, lessonId: string, correct: boolean): AttemptLogEntry {
  return buildAttemptEntry({
    lessonId,
    objectiveCode: '2Nc.01',
    kind: 'type-number',
    difficulty: 1,
    answer: correct ? '5' : '6',
    correct,
    responseTimeMs: 1200,
    masteryBefore: 0.2,
    masteryAfter: 0.3,
    reason: 'in-lesson',
    ts,
  })
}

describe('recap activity log helpers (WS15)', () => {
  it('recap normalise filters junk, dedupes, sorts and caps at 60 days', () => {
    const junky = ['2026-08-03', 'nope', '2026-08-01', '2026-08-03', 42 as unknown as string, '']
    const out = normaliseActivityDays(junky)
    expect(out).toEqual(['2026-08-01', '2026-08-03'])

    const big = daysBefore(new Date(2026, 8, 30), ACTIVITY_DAYS_CAP + 10)
    const capped = normaliseActivityDays(big)
    expect(capped).toHaveLength(ACTIVITY_DAYS_CAP)
    expect(capped[0]).toBe(big[10]) // oldest 10 dropped
    expect(capped[capped.length - 1]).toBe('2026-09-29')
  })

  it('recap addActivityDay appends today once and keeps the cap', () => {
    expect(addActivityDay([], '2026-09-20')).toEqual(['2026-09-20'])
    expect(addActivityDay(['2026-09-20'], '2026-09-20')).toEqual(['2026-09-20'])
    expect(addActivityDay(undefined, 'garbage-day')).toEqual([])

    const full = daysBefore(new Date(2026, 8, 30), ACTIVITY_DAYS_CAP)
    const grown = addActivityDay(full, '2026-10-01')
    expect(grown).toHaveLength(ACTIVITY_DAYS_CAP)
    expect(grown[grown.length - 1]).toBe('2026-10-01')
    expect(grown[0]).not.toBe(full[0]) // oldest fell off
  })

  it('recap mergeActivityDays unions both devices and drops invalid days', () => {
    const a = ['2026-09-01', '2026-09-03', 'junk']
    const b = ['2026-09-03', '2026-09-02']
    expect(mergeActivityDays(a, b)).toEqual(['2026-09-01', '2026-09-02', '2026-09-03'])
    expect(mergeActivityDays(undefined, b)).toEqual(['2026-09-02', '2026-09-03'])
    expect(mergeActivityDays(null, null)).toEqual([])
  })
})

describe('activity calendar day-roll (store, WS15)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-20T09:30:00'))
    usePlayer.setState({ activityDays: [], lastActiveDay: null, cardStars: {}, cardsWonWeek: 0 })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('recap practice rounds mark the current day exactly once', () => {
    usePlayer.getState().recordPractice({ xp: 2, correct: 1, totalQuestions: 1 })
    usePlayer.getState().recordPractice({ xp: 2, correct: 1, totalQuestions: 1 })
    expect(usePlayer.getState().activityDays).toEqual(['2026-09-20'])
  })

  it('recap a new calendar day appends after the previous practised day', () => {
    usePlayer.getState().recordPractice({ xp: 2, correct: 1, totalQuestions: 1 })
    vi.setSystemTime(new Date('2026-09-21T08:00:00'))
    usePlayer.getState().recordPractice({ xp: 2, correct: 1, totalQuestions: 1 })
    expect(usePlayer.getState().activityDays).toEqual(['2026-09-20', '2026-09-21'])
  })

  it('recap a lesson finish marks the practice calendar too', () => {
    usePlayer.getState().completeLesson({
      lessonId: 'u1l1',
      xp: 10,
      correct: 3,
      totalQuestions: 3,
      crownsGained: 1,
      accuracy: 100,
    })
    expect(usePlayer.getState().activityDays).toContain('2026-09-20')
  })

  it('recap arcade XP marks the practice calendar', () => {
    usePlayer.getState().addArcadeXp(5)
    expect(usePlayer.getState().activityDays).toEqual(['2026-09-20'])
  })

  it('recap a busy day never grows the log past the 60-day cap', () => {
    const seed = daysBefore(new Date(2026, 7, 20), ACTIVITY_DAYS_CAP) // 60 days ending 2026-08-19
    usePlayer.setState({ activityDays: seed })
    usePlayer.getState().recordPractice({ xp: 2, correct: 1, totalQuestions: 1 })
    const out = usePlayer.getState().activityDays
    expect(out).toHaveLength(ACTIVITY_DAYS_CAP)
    expect(out[out.length - 1]).toBe('2026-09-20')
    expect(out[0]).toBe(seed[1]) // oldest dropped
  })

  it('recap synced snapshots union into the local calendar without losses', () => {
    usePlayer.setState({ activityDays: ['2026-09-10', '2026-09-12'] })
    usePlayer.getState().applySyncedSnapshot({ activityDays: ['2026-09-12', '2026-09-15', 'bad'] })
    expect(usePlayer.getState().activityDays).toEqual(['2026-09-10', '2026-09-12', '2026-09-15'])
  })
})

describe('cloudsave activity union (WS15)', () => {
  it('recap snapshot whitelists only valid capped activity days', () => {
    const snap = snapshotFromPlayer({
      ...(save({ activityDays: ['2026-08-01', 'junk', '2026-08-01'] }) as unknown as Parameters<
        typeof snapshotFromPlayer
      >[0]),
    })
    expect(snap.activityDays).toEqual(['2026-08-01'])
    expect('todayXp' in snap).toBe(false)
  })

  it('recap cloud merge unions activityDays from both devices', () => {
    const merged = mergeCloudSave(
      save({ activityDays: ['2026-08-01', '2026-08-03'] }),
      save({ activityDays: ['2026-08-03', '2026-08-05'], updatedAt: 2000 }),
    )!
    expect(merged.activityDays).toEqual(['2026-08-01', '2026-08-03', '2026-08-05'])
  })

  it('recap cloud merge tolerates old saves with no activityDays field', () => {
    const merged = mergeCloudSave(save(), save({ updatedAt: 2000 }))!
    expect(merged.activityDays).toEqual([])
  })
})

describe('weekly recap math (WS15)', () => {
  const NOW = new Date('2026-09-25T15:00:00').getTime()
  const at = (daysAgo: number, hour = 10) => {
    const d = new Date(NOW)
    d.setDate(d.getDate() - daysAgo)
    d.setHours(hour, 0, 0, 0)
    return d.getTime()
  }
  const base = {
    weeklyXp: 42,
    weeklyXpWeek: '2026-09-21',
    cardsWonWeek: 3,
    cardsWonWeekKey: '2026-09-21',
    activityDays: [] as string[],
    attempts: [] as AttemptLogEntry[],
  }

  it('recap window counts only attempts from the last 7 days', () => {
    const attempts = [
      attemptAt(at(0), 'u1l1', true),
      attemptAt(at(6), 'u1l1', true),
      attemptAt(at(7, 9), 'u1l1', false), // exactly 7 days ago → outside
      attemptAt(at(30), 'u1l1', true),
    ]
    const r = buildWeeklyRecap({ ...base, attempts }, NOW)
    expect(r.attemptCount).toBe(2)
    expect(r.correctCount).toBe(2)
    expect(r.windowStart).toBe(isoOf(new Date(NOW - 6 * 86400000)))
    expect(r.windowEnd).toBe('2026-09-25')
  })

  it('recap accuracy is a rounded percent with correct and total counts', () => {
    const attempts = [
      attemptAt(at(0), 'u1l1', true),
      attemptAt(at(1), 'u1l1', false),
      attemptAt(at(2), 'u1l1', true),
    ]
    const r = buildWeeklyRecap({ ...base, attempts }, NOW)
    expect(r.accuracyPct).toBe(67) // 2/3 = 66.6… → 67
    expect(r.correctCount).toBe(2)
    expect(r.attemptCount).toBe(3)
  })

  it('recap with no attempts in the window reports null accuracy', () => {
    const r = buildWeeklyRecap({ ...base }, NOW)
    expect(r.accuracyPct).toBeNull()
    expect(r.attemptCount).toBe(0)
    expect(r.subjects).toEqual([])
  })

  it('recap subjects touched come back in canonical display order', () => {
    const attempts = [
      attemptAt(at(0), 'd1l1', true), // social
      attemptAt(at(1), 'e1l1', true), // english
      attemptAt(at(2), 'u1l1', true), // math
      attemptAt(at(3), 'u1l2', true), // math again → distinct
    ]
    const r = buildWeeklyRecap({ ...base, attempts }, NOW)
    expect(r.subjects).toEqual(['math', 'english', 'social'])
  })

  it('recap cards won shows zero when the counter week key is stale', () => {
    const fresh = buildWeeklyRecap({ ...base }, NOW)
    expect(fresh.cardsWon).toBe(3)
    const stale = buildWeeklyRecap({ ...base, cardsWonWeekKey: '2026-09-14' }, NOW)
    expect(stale.cardsWon).toBe(0)
  })

  it('recap active days counts practised days inside the window only', () => {
    const activityDays = ['2026-09-19', '2026-09-23', '2026-09-25', '2026-09-10', 'junk']
    const r = buildWeeklyRecap({ ...base, activityDays }, NOW)
    expect(r.activeDays).toBe(3) // 09-19 is window start; 09-10 outside
  })

  it('recap league week XP is passed through untouched', () => {
    expect(buildWeeklyRecap({ ...base, weeklyXp: 120 }, NOW).xp).toBe(120)
    expect(buildWeeklyRecap({ ...base, weeklyXp: -5 }, NOW).xp).toBe(0)
  })
})

describe('month grid layout (WS15)', () => {
  const NOW = new Date('2026-09-20T12:00:00').getTime()

  it('recap month grid is Monday-first and counts practised days', () => {
    const grid = buildMonthGrid(2026, 8, ['2026-09-01', '2026-09-15'], NOW)
    const expectedOffset = (new Date(2026, 8, 1).getDay() + 6) % 7
    expect(grid.cells[expectedOffset]?.day).toBe(1)
    if (expectedOffset > 0) expect(grid.cells[0]).toBeNull()
    expect(grid.cells.length % 7).toBe(0)
    expect(grid.monthLabel).toBe('September')
    expect(grid.practisedCount).toBe(2)
    expect(grid.cells.find((c) => c?.iso === '2026-09-15')?.active).toBe(true)
  })

  it('recap month grid highlights today and greys future days', () => {
    const grid = buildMonthGrid(2026, 8, [], NOW)
    expect(grid.cells.find((c) => c?.iso === '2026-09-20')?.isToday).toBe(true)
    expect(grid.cells.find((c) => c?.iso === '2026-09-21')?.future).toBe(true)
    expect(grid.cells.find((c) => c?.iso === '2026-09-19')?.future).toBe(false)
    expect(grid.practisedCount).toBe(0)
  })
})

describe('weekly card counters (store, WS15)', () => {
  const emptyChest: ChestResult = {
    startTier: 'common',
    finalTier: 'common',
    upgradesAt: [],
    gems: 0,
    dust: 0,
    cards: [],
    jackpot: false,
  }
  const chestWith = (cardId: string): ChestResult => ({
    ...emptyChest,
    cards: [{ cardId, isNew: false, leveledUp: false } as ChestResult['cards'][number]],
  })

  beforeEach(() => {
    usePlayer.setState({
      cardsWonWeek: 0,
      cardsWonWeekKey: usePlayer.getState().weeklyXpWeek,
      cardStars: {},
    })
  })

  it('recap chest drops add one to the weekly cards counter', () => {
    usePlayer.getState().grantChest(chestWith('sonic'))
    expect(usePlayer.getState().cardsWonWeek).toBe(1)
    usePlayer.getState().grantChest(emptyChest) // cardless chest → no change
    expect(usePlayer.getState().cardsWonWeek).toBe(1)
  })

  it('recap real chest rolls feed the weekly cards counter', () => {
    const chest = rollChest(mulberry32(7), 'normal', {}, 0)
    usePlayer.getState().grantChest(chest)
    expect(usePlayer.getState().cardsWonWeek).toBe(chest.cards.length)
  })

  it('recap arcade card unlock counts once and repeats count zero', () => {
    const id = ARCADE_CARDS[0].id
    expect(usePlayer.getState().grantArcadeCard(id)).toBe(true)
    expect(usePlayer.getState().cardsWonWeek).toBe(1)
    expect(usePlayer.getState().grantArcadeCard(id)).toBe(false)
    expect(usePlayer.getState().cardsWonWeek).toBe(1)
  })

  it('recap weekly cards counter lazy-resets when the league week rolls', () => {
    usePlayer.setState({ cardsWonWeek: 5, cardsWonWeekKey: '2026-09-14', weeklyXpWeek: '2026-09-21' })
    usePlayer.getState().grantChest(emptyChest)
    expect(usePlayer.getState().cardsWonWeek).toBe(0)
    expect(usePlayer.getState().cardsWonWeekKey).toBe('2026-09-21')
    usePlayer.getState().grantChest(chestWith('sonic'))
    expect(usePlayer.getState().cardsWonWeek).toBe(1)
  })
})
