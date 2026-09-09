import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayer } from '../src/engine/store'
import { todayISO, yesterdayISO } from '../src/engine/gamification'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

beforeEach(() => {
  usePlayer.setState({
    gems: 1000,
    shopInventory: {},
    doubleXpLessons: 0,
    chestBoost: false,
    megaChest: false,
    luckyTickets: 0,
    streakSavers: 0,
    streakCurrent: 0,
    streakLongest: 0,
    lastActiveDay: todayISO(),
    xpTotal: 0,
    todayXp: 0,
    todayXpDay: todayISO(),
    lessonsToday: 0,
    lessonsTodayDay: todayISO(),
    correctToday: 0,
    correctTodayDay: todayISO(),
    weeklyXp: 0,
    lessonProgress: {},
    achievements: [],
  })
})

describe('shop boost purchases actually activate', () => {
  it('double-xp purchase adds lesson charges and deducts gems', () => {
    const r = usePlayer.getState().buyItem('double-xp')
    expect(r.success).toBe(true)
    expect(usePlayer.getState().doubleXpLessons).toBe(3)
    expect(usePlayer.getState().gems).toBe(900)
  })

  it('chest-boost purchase switches the flag on; rebuy stacks while under maxStack', () => {
    expect(usePlayer.getState().buyItem('chest-boost').success).toBe(true)
    expect(usePlayer.getState().chestBoost).toBe(true)
    const gemsAfterFirst = usePlayer.getState().gems
    const r = usePlayer.getState().buyItem('chest-boost')
    expect(r.success).toBe(true)
    expect(usePlayer.getState().gems).toBe(gemsAfterFirst - 75)
  })

  it('mega-chest purchase switches the flag on; rebuy stacks while under maxStack', () => {
    expect(usePlayer.getState().buyItem('mega-chest').success).toBe(true)
    expect(usePlayer.getState().megaChest).toBe(true)
    expect(usePlayer.getState().buyItem('mega-chest').success).toBe(true)
  })

  it('lucky-ticket and streak-saver purchases stack counters', () => {
    expect(usePlayer.getState().buyItem('lucky-ticket').success).toBe(true)
    expect(usePlayer.getState().buyItem('lucky-ticket').success).toBe(true)
    expect(usePlayer.getState().luckyTickets).toBe(2)
    expect(usePlayer.getState().buyItem('streak-saver').success).toBe(true)
    expect(usePlayer.getState().streakSavers).toBe(1)
  })

  it('unknown items and insufficient gems change nothing', () => {
    expect(usePlayer.getState().buyItem('nope').success).toBe(false)
    usePlayer.setState({ gems: 10 })
    expect(usePlayer.getState().buyItem('mega-chest').success).toBe(false)
    expect(usePlayer.getState().gems).toBe(10)
    expect(usePlayer.getState().megaChest).toBe(false)
  })
})

describe('boost consumption in lessons', () => {
  it('double-xp charge is consumed via useDoubleXp (the ×2 math lives in LessonScreen, proven E2E)', () => {
    usePlayer.getState().buyItem('double-xp')
    expect(usePlayer.getState().doubleXpLessons).toBe(3)
    usePlayer.getState().useDoubleXp()
    expect(usePlayer.getState().doubleXpLessons).toBe(2)
  })

  it('streak saver bridges a missed day instead of resetting', () => {
    usePlayer.setState({ lastActiveDay: daysAgo(5), streakCurrent: 5, streakLongest: 5, streakSavers: 1 })
    usePlayer.getState().completeLesson({
      lessonId: 'u1l1', xp: 10, correct: 9, totalQuestions: 10, crownsGained: 0, accuracy: 90,
    })
    expect(usePlayer.getState().streakSavers).toBe(0)
    expect(usePlayer.getState().streakCurrent).toBe(6)
  })

  it('without a saver a missed stretch resets the streak', () => {
    usePlayer.setState({ lastActiveDay: daysAgo(5), streakCurrent: 5, streakLongest: 5, streakSavers: 0 })
    usePlayer.getState().completeLesson({
      lessonId: 'u1l1', xp: 10, correct: 9, totalQuestions: 10, crownsGained: 0, accuracy: 90,
    })
    expect(usePlayer.getState().streakCurrent).toBe(1)
  })

  it('yesterday needs no saver', () => {
    usePlayer.setState({ lastActiveDay: yesterdayISO(), streakCurrent: 4, streakLongest: 4, streakSavers: 1 })
    usePlayer.getState().completeLesson({
      lessonId: 'u1l1', xp: 10, correct: 10, totalQuestions: 10, crownsGained: 1, accuracy: 100,
    })
    expect(usePlayer.getState().streakSavers).toBe(1)
    expect(usePlayer.getState().streakCurrent).toBe(5)
  })
})
