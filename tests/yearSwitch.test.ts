import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  usePlayer,
  questProgressSnapshot,
  questsDone,
  isQuestClaimed,
} from '../src/engine/store'
import { todayISO } from '../src/engine/gamification'
import { documentTitleFor, applyDocumentTitle } from '../src/engine/branding'
import { ProfileScreen } from '../src/screens/ProfileScreen'

/** PLAN Phase 31 step 160 — Profile year chip + switch regeneration. */
describe('PLAN 160 — year chip / switcher regeneration', () => {
  it('documentTitleFor matches the static index.html title for Year 2', () => {
    expect(documentTitleFor(2)).toBe('Momo Year 2 Cambridge – Learning Adventure')
    expect(documentTitleFor(1)).toBe('Momo Year 1 Cambridge – Learning Adventure')
    expect(documentTitleFor(3)).toBe('Momo Year 3 Cambridge – Learning Adventure')
    expect(documentTitleFor(4)).toBe('Momo Year 4 Cambridge – Learning Adventure')
    // no DOM in node — the apply helper must be a safe no-op
    expect(() => applyDocumentTitle(2)).not.toThrow()
  })

  it('a year switch re-rolls stale day counters so daily quests regenerate', () => {
    usePlayer.setState({
      yearLevel: 2,
      todayXpDay: '2020-01-01', todayXp: 99,
      lessonsTodayDay: '2020-01-01', lessonsToday: 5,
      correctTodayDay: '2020-01-01', correctToday: 9,
      bossesTodayDay: '2020-01-01', bossesToday: 2,
      arcadeCorrectTodayDay: '2020-01-01', arcadeCorrectToday: 7,
      sprintsTodayDay: '2020-01-01', sprintsToday: 3,
      claimedQuests: { day: '2020-01-01', questIds: ['xp20'] },
    })
    // read-guard already reports 0 for a stale day...
    expect(questProgressSnapshot(usePlayer.getState()).xpToday).toBe(0)

    usePlayer.getState().setYearLevel(1)
    const st = usePlayer.getState()
    expect(st.yearLevel).toBe(1)

    // ...but the switch itself rolls the raw counters to today + zeroed.
    const today = todayISO()
    expect(st.todayXpDay).toBe(today)
    expect(st.lessonsTodayDay).toBe(today)
    expect(st.correctTodayDay).toBe(today)
    expect(st.bossesTodayDay).toBe(today)
    expect(st.arcadeCorrectTodayDay).toBe(today)
    expect(st.sprintsTodayDay).toBe(today)
    expect(st.todayXp).toBe(0)
    expect(st.lessonsToday).toBe(0)
    expect(st.correctToday).toBe(0)
    expect(st.bossesToday).toBe(0)
    expect(st.arcadeCorrectToday).toBe(0)
    expect(st.sprintsToday).toBe(0)

    // fresh quest roll: nothing earned, yesterday's claim gone
    expect(questsDone(usePlayer.getState())).toEqual([])
    expect(isQuestClaimed(usePlayer.getState(), 'xp20')).toBe(false)
  })

  it('a year switch re-rolls an elapsed league week (weekly recap regenerates)', () => {
    usePlayer.setState({
      yearLevel: 2,
      weeklyXpWeek: '2020-01-01',
      weeklyXp: 500,
      pendingLeagueSettle: null,
    })
    usePlayer.getState().setYearLevel(3)
    const st = usePlayer.getState()
    expect(st.yearLevel).toBe(3)
    expect(st.weeklyXp).toBe(0)
    expect(st.weeklyXpWeek).toBe(todayISO())
    // the earned XP is parked for league settlement, never dropped
    expect(st.pendingLeagueSettle).toEqual({ weekKey: '2020-01-01', xp: 500 })
  })

  it('a same-year switch is a no-op (no bucket churn)', () => {
    const before = usePlayer.getState()
    before.setYearLevel(before.yearLevel)
    const after = usePlayer.getState()
    expect(after.paths).toEqual(before.paths)
    expect(after.yearLevel).toBe(before.yearLevel)
  })

  it('Profile renders the year chip showing the active year', () => {
    usePlayer.setState({ name: 'Chip Kid', yearLevel: 2 })
    const html = renderToStaticMarkup(createElement(ProfileScreen))
    expect(html).toContain('data-testid="year-chip"')
    expect(html).toContain('📅 Year 2')
    // the switcher panel only opens on tap — closed on first render
    expect(html).not.toContain('data-testid="year-switcher"')
    expect(html).toContain('data-testid="profile-friends-entry"')
  })
})
