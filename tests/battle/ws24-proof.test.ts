import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayer } from '../../src/engine/store'
import { BATTLE_CARD_GOALS } from '../../src/engine/cards'
import { todayISO } from '../../src/engine/gamification'

/** WS24 — R0 PROOF (the user's rule, enforced). Seeds a full mid-game save
 *  (lesson mastery, gems, cards, streaks — exactly what a v11 player had
 *  AFTER the battle-slice migrate backfilled the 7 fields), runs a COMPLETE
 *  battle session (first-clear win + chest, a loss, per-card battle XP, a
 *  Daily Rival rematch), then DEEP-DIFFS the store. Two hard guarantees:
 *
 *   1. Lesson-mastery keys (`lessonProgress`, `lessonsToday`, `lessonsTodayDay`)
 *      are byte-identical before vs after — battles never touch crowns/lessons.
 *   2. Every key that DID change is inside an explicit allowlist = the 7 battle
 *      fields + the approved first-clear chest/XP path + same-day bookkeeping.
 *      Anything else moving is a regression (fails the test). */

// The 7 additive battle fields (WS20 slice).
const BATTLE_KEYS = [
  'battleCleared', 'battleWins', 'battleTrophies', 'battleSquad',
  'cardBattleXp', 'battleDailyBossDay', 'battleDailyBossDone',
] as const

// Approved to move during a battle session: the 7 battle fields + the
// first-clear victory-chest/XP path (grantChest + GYM_XP) + same-day activity
// bookkeeping (rollDay/markActivity are no-ops when seeded to today).
const ALLOWED_KEYS = new Set<string>([
  ...BATTLE_KEYS,
  'gems', 'xpTotal', 'todayXp', 'weeklyXp',            // first-clear XP + gems
  'cardStars', 'cardPity', 'cardsWonWeek', 'cardsWonWeekKey', // victory chest (grantChest)
  'lastActiveDay', 'activityDays',                     // markActivity (same day)
])

const today = todayISO()

beforeEach(() => {
  // Seed a realistic mid-game save. Day keys pinned to `today` so rollDay /
  // rollWeek / markActivity are same-day no-ops — keeping the diff to exactly
  // the battle + chest path.
  usePlayer.setState({
    name: 'Champion',
    gems: 500,
    xpTotal: 400,
    todayXp: 20,
    todayXpDay: today,
    weeklyXp: 120,
    weeklyXpWeek: today,
    lastActiveDay: today,
    activityDays: [today],
    lessonsToday: 3,
    lessonsTodayDay: today,
    lessonProgress: {
      u1l1: { crown: 3, bestAccuracy: 100, completions: 2 },
      u1l2: { crown: 2, bestAccuracy: 80, completions: 1 },
      u2l5: { crown: 1, bestAccuracy: 60, completions: 1 },
    },
    cardStars: { sonic: 4, tails: 3, knuckles: 2 },
    cardPity: 2,
    cardsWonWeek: 3,
    cardsWonWeekKey: today,
    // battle slice (post-migrate defaults)
    battleCleared: [],
    battleWins: 0,
    battleTrophies: 0,
    battleSquad: [],
    cardBattleXp: {},
    battleDailyBossDay: today,
    battleDailyBossDone: false,
  })
})

/** Data-only snapshot (JSON round-trip drops zustand action functions). */
function snap(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(usePlayer.getState()))
}

function diffKeys(a: Record<string, unknown>, b: Record<string, unknown>): string[] {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const changed: string[] = []
  for (const k of keys) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) changed.push(k)
  }
  return changed
}

describe('WS24 R0 proof — a full battle session never mutates lesson mastery', () => {
  it('lessonProgress / lessonsToday / lessonsTodayDay are byte-identical after win + loss + rival', () => {
    const before = snap()
    // 1) gym 1 first-clear win (full prize + deterministic victory chest)
    usePlayer.getState().battleFinished({
      gym: 1, won: true, gems: 14, xp: 30, perCardXp: { sonic: 15, tails: 15, knuckles: 15 }, rng: () => 0,
    })
    // 2) gym 2 loss (consolation + per-card loss XP)
    usePlayer.getState().battleFinished({
      gym: 2, won: false, gems: 20, xp: 40, perCardXp: { sonic: 5, tails: 5, knuckles: 5 },
    })
    // 3) Daily Rival rematch win on the cleared gym 1
    usePlayer.getState().battleFinished({
      gym: 1, won: true, gems: 0, xp: 0, perCardXp: { sonic: 15 }, dailyRival: true,
    })
    const after = snap()
    for (const k of ['lessonProgress', 'lessonsToday', 'lessonsTodayDay']) {
      expect(after[k], `battle mutated protected key ${k}`).toEqual(before[k])
    }
  })

  it('every changed key is in the battle + approved-chest allowlist (nothing else moves)', () => {
    const before = snap()
    usePlayer.getState().battleFinished({
      gym: 1, won: true, gems: 14, xp: 30, perCardXp: { sonic: 15 }, rng: () => 0,
    })
    usePlayer.getState().battleFinished({
      gym: 2, won: false, gems: 20, xp: 40, perCardXp: { sonic: 5 },
    })
    const changed = diffKeys(before, snap())
    const offenders = changed.filter((k) => !ALLOWED_KEYS.has(k))
    expect(offenders, `battle moved non-allowlisted keys: ${offenders.join(', ')}`).toEqual([])
  })

  it('the battle fields themselves DO progress (proves the session actually ran)', () => {
    usePlayer.getState().battleFinished({
      gym: 1, won: true, gems: 14, xp: 30, perCardXp: { sonic: 15 }, rng: () => 0,
    })
    const s = usePlayer.getState()
    expect(s.battleCleared).toContain(1)
    expect(s.battleTrophies).toBe(1)
    expect(s.battleWins).toBe(1)
    expect(s.cardBattleXp.sonic).toBe(15)
  })

  it('a milestone clear (gym 4) grants its battle card WITHOUT touching lessonProgress', () => {
    const before = snap()
    usePlayer.setState({ battleCleared: [1, 2, 3] })
    usePlayer.getState().battleFinished({
      gym: 4, won: true, gems: 32, xp: 60, perCardXp: { sonic: 15 }, rng: () => 0,
    })
    const after = snap()
    expect(after.lessonProgress).toEqual(before.lessonProgress)
    // mecha-sonic unlocked (approved card-grant path)
    expect(usePlayer.getState().cardStars[BATTLE_CARD_GOALS['mecha-sonic'] ? 'mecha-sonic' : '']).toBeDefined()
    const changed = diffKeys(before, after)
    const offenders = changed.filter((k) => !ALLOWED_KEYS.has(k))
    expect(offenders, `milestone clear moved non-allowlisted keys: ${offenders.join(', ')}`).toEqual([])
  })
})
