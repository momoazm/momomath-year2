import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SPRINT_MS,
  SPRINT_SECONDS,
  applySprintAnswer,
  buildSprintBank,
  collectUnitMcqs,
  initialSprintRun,
  isSprintTimeUp,
  isNewSprintBest,
  sprintAccuracy,
  sprintDeck,
  sprintRemainingMs,
  sprintXpFor,
} from '../src/engine/sprint'
import { ACHIEVEMENTS, DAILY_QUESTS, todayISO } from '../src/engine/gamification'
import { getCurriculum } from '../src/content/registry'
import { usePlayer } from '../src/engine/store'

/* ------------------------------------------------------------- *
 * WS16 — Flashcard Sprint: timer, score rules, bank, store wiring *
 * ------------------------------------------------------------- */

describe('sprint timer rules (WS16)', () => {
  it('sprint timer starts at 60s and counts down to zero', () => {
    expect(SPRINT_SECONDS).toBe(60)
    expect(SPRINT_MS).toBe(60_000)
    const t0 = 1_000_000
    expect(sprintRemainingMs(t0, t0)).toBe(SPRINT_MS)
    expect(sprintRemainingMs(t0, t0 + 1_000)).toBe(59_000)
    expect(sprintRemainingMs(t0, t0 + 59_999)).toBe(1)
    expect(sprintRemainingMs(t0, t0 + SPRINT_MS)).toBe(0)
  })

  it('sprint timer clamps at zero (no negative time, clock skew safe)', () => {
    const t0 = 1_000_000
    expect(sprintRemainingMs(t0, t0 + 10 * SPRINT_MS)).toBe(0)
    expect(isSprintTimeUp(t0, t0 + SPRINT_MS)).toBe(true)
    expect(isSprintTimeUp(t0, t0 + SPRINT_MS - 1)).toBe(false)
    // startedAt in the future (skewed clock) still clamps to full round
    expect(sprintRemainingMs(t0, t0 - 5_000)).toBe(SPRINT_MS)
  })
})

describe('sprint score rules (WS16)', () => {
  it('sprint correct answers add score and extend the streak', () => {
    let run = initialSprintRun()
    run = applySprintAnswer(run, true)
    expect(run).toEqual({ score: 1, streak: 1, bestStreak: 1, answered: 1 })
    run = applySprintAnswer(run, true)
    expect(run).toEqual({ score: 2, streak: 2, bestStreak: 2, answered: 2 })
  })

  it('sprint wrong answer resets the streak but keeps the score', () => {
    let run = initialSprintRun()
    run = applySprintAnswer(run, true)
    run = applySprintAnswer(run, true)
    run = applySprintAnswer(run, false)
    expect(run.score).toBe(2)
    expect(run.streak).toBe(0)
    expect(run.answered).toBe(3)
    expect(run.bestStreak).toBe(2)
    run = applySprintAnswer(run, true)
    expect(run.streak).toBe(1)
    expect(run.bestStreak).toBe(2)
  })

  it('sprint XP payout is 1 per correct answer and never negative', () => {
    expect(sprintXpFor(0)).toBe(0)
    expect(sprintXpFor(7)).toBe(7)
    expect(sprintXpFor(-3)).toBe(0)
    expect(sprintXpFor(NaN)).toBe(0)
  })

  it('sprint best flag fires only on a strictly higher score than 0', () => {
    expect(isNewSprintBest(0, 0)).toBe(false)
    expect(isNewSprintBest(5, 0)).toBe(true)
    expect(isNewSprintBest(5, 5)).toBe(false)
    expect(isNewSprintBest(4, 5)).toBe(false)
    expect(isNewSprintBest(-1, -2)).toBe(false)
  })

  it('sprint accuracy rounds percent or is null with no answers', () => {
    expect(sprintAccuracy(initialSprintRun())).toBeNull()
    const twoOfThree = { score: 2, streak: 0, bestStreak: 2, answered: 3 }
    expect(sprintAccuracy(twoOfThree)).toBe(67)
    const perfect = { score: 4, streak: 4, bestStreak: 4, answered: 4 }
    expect(sprintAccuracy(perfect)).toBe(100)
  })
})

describe('sprint bank (WS16)', () => {
  it('sprint bank is non-empty for every english unit', () => {
    const units = getCurriculum('english').units
    expect(units.length).toBeGreaterThan(0)
    for (const unit of units) {
      const cards = collectUnitMcqs(unit)
      expect(cards.length, `unit ${unit.id} produced no sprint MCQs`).toBeGreaterThanOrEqual(1)
    }
  })

  it('sprint bank cards are well-formed, deduped and fully visual', () => {
    const bank = buildSprintBank()
    expect(bank.length).toBeGreaterThanOrEqual(20)
    const prompts = new Set<string>()
    for (const card of bank) {
      expect(card.prompt.trim().length).toBeGreaterThan(0)
      expect(card.choices.length).toBeGreaterThanOrEqual(2)
      expect(card.choices.length).toBeLessThanOrEqual(4)
      expect(Number.isInteger(card.answerIndex)).toBe(true)
      expect(card.answerIndex).toBeGreaterThanOrEqual(0)
      expect(card.answerIndex).toBeLessThan(card.choices.length)
      expect(card.unitId).toMatch(/^e\d+/)
      // no audio-only prompts — the sprint has no playback
      expect(card.prompt).not.toMatch(/\b(hear|listen|sound)\b/i)
      expect(prompts.has(card.prompt)).toBe(false)
      prompts.add(card.prompt)
    }
  })

  it('sprint deck shuffle is deterministic per seed and a full permutation', () => {
    const bank = buildSprintBank().slice(0, 30)
    const byPrompt = (cards: typeof bank) =>
      [...cards].sort((p, q) => p.prompt.localeCompare(q.prompt))
    const a = sprintDeck(bank, 7)
    const b = sprintDeck(bank, 7)
    expect(a).toEqual(b)
    expect(a).toHaveLength(bank.length)
    expect(byPrompt(a)).toEqual(byPrompt(bank))
    // different seed still yields a full permutation
    const c = sprintDeck(bank, 99)
    expect(c).toHaveLength(bank.length)
    expect(byPrompt(c)).toEqual(byPrompt(bank))
  })
})

describe('sprint store wiring (WS16)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-20T10:00:00'))
    usePlayer.setState({
      sprintBest: 0,
      sprintRuns: 0,
      sprintsTodayDay: todayISO(),
      sprintsToday: 0,
      activityDays: [],
      lastActiveDay: null,
      achievements: [],
      cardStars: {},
      cardsWonWeek: 0,
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sprint finish bumps runs, best and today counter, and marks the calendar', () => {
    usePlayer.getState().finishSprint(7)
    let s = usePlayer.getState()
    expect(s.sprintRuns).toBe(1)
    expect(s.sprintBest).toBe(7)
    expect(s.sprintsToday).toBe(1)
    expect(s.activityDays).toContain(todayISO())

    usePlayer.getState().finishSprint(3)
    s = usePlayer.getState()
    expect(s.sprintRuns).toBe(2)
    expect(s.sprintBest).toBe(7) // lower score never overwrites the best
    expect(s.sprintsToday).toBe(2)
  })

  it('sprint today counter resets on a new day (day-roll)', () => {
    usePlayer.getState().finishSprint(4)
    expect(usePlayer.getState().sprintsToday).toBe(1)
    vi.setSystemTime(new Date('2026-09-21T10:00:00'))
    usePlayer.getState().finishSprint(2)
    const s = usePlayer.getState()
    expect(s.sprintsToday).toBe(1) // fresh day → only today's run counted
    expect(s.sprintRuns).toBe(2) // lifetime is never reset
    expect(s.sprintBest).toBe(4)
  })

  it('sprint1 daily quest progresses from sprintsToday', () => {
    const q = DAILY_QUESTS.find((x) => x.id === 'sprint1')!
    expect(q.goal).toBe(1)
    expect(q.reward).toBeGreaterThanOrEqual(10)
    expect(q.label(q.goal).toLowerCase()).toContain('sprint')
    const snap = {
      xpToday: 0,
      lessonsToday: 0,
      correctToday: 0,
      subjectsToday: [],
      arcadeCorrectToday: 0,
      sprintsToday: 0,
    }
    expect(q.progress(snap)).toBe(0)
    expect(q.progress({ ...snap, sprintsToday: 1 })).toBe(1)
  })

  it('sprint achievement unlocks after the first finished sprint', () => {
    const a = ACHIEVEMENTS.find((x) => x.id === 'sprint-debut')!
    const base = {
      xpTotal: 0,
      streakCurrent: 0,
      lessonsCompleted: 0,
      crowns: 0,
      subjectCount: 0,
      cardsOwned: 0,
      arcadeBests: 0,
      arcadeTop: 0,
      sprintRuns: 0,
    }
    expect(a.test({ ...base, sprintRuns: 0 })).toBe(false)
    expect(a.test({ ...base, sprintRuns: 1 })).toBe(true)
  })
})
