import { beforeEach, describe, expect, it } from 'vitest'
import {
  DAILY_RIVAL_BONUS_GEMS,
  LOSS_CONSOLATION_GEMS,
  REPEAT_WIN_GEMS,
  usePlayer,
} from '../../src/engine/store'
import { todayISO } from '../../src/engine/gamification'

/** WS20 — Momo Battle additive store slice (R0). Proves the 7 new battle
 *  fields are backfilled on migrate, driven by `battleFinished`, and — most
 *  importantly — that they are LOCAL-ONLY: `applySyncedSnapshot` never touches
 *  them, and `battleFinished` never mutates lesson/XP/gems progress. */

const BATTLE_KEYS = [
  'battleCleared',
  'battleWins',
  'battleTrophies',
  'battleSquad',
  'cardBattleXp',
  'battleDailyBossDay',
  'battleDailyBossDone',
] as const

beforeEach(() => {
  usePlayer.setState({
    gems: 1000,
    xpTotal: 0,
    todayXp: 0,
    todayXpDay: todayISO(),
    weeklyXp: 0,
    cardStars: {},
    cardPity: 0,
    lessonProgress: {},
    battleCleared: [],
    battleWins: 0,
    battleTrophies: 0,
    battleSquad: [],
    cardBattleXp: {},
    battleDailyBossDay: todayISO(),
    battleDailyBossDone: false,
  })
})

describe('battleFinished — first clear pays rewards exactly once', () => {
  it('first win grants gems/XP, clears the gym, bumps win/trophy counters, and rolls a victory chest', () => {
    const chest = usePlayer.getState().battleFinished({
      gym: 1,
      won: true,
      gems: 14,
      xp: 30,
      perCardXp: { sonic: 15 },
      rng: () => 0, // deterministic chest
    })
    const s = usePlayer.getState()
    expect(s.battleCleared).toContain(1)
    expect(s.battleWins).toBe(1)
    expect(s.battleTrophies).toBe(1)
    // WS23: first clear returns + grants a victory chest; its gems + duplicate
    // dust are ADDED on top of the 14 first-clear gems (approved new caller).
    expect(chest).not.toBeNull()
    expect(s.gems).toBe(1014 + (chest?.gems ?? 0) + (chest?.dust ?? 0))
    expect(s.xpTotal).toBe(30)
    expect(s.cardBattleXp.sonic).toBe(15)
  })

  it('repeating the same gym pays only the tiny anti-farm gems (no re-pay of the full prize)', () => {
    const args = { gym: 2, won: true, gems: 20, xp: 40, perCardXp: { tails: 15 } }
    usePlayer.getState().battleFinished(args)
    const gemsAfterFirst = usePlayer.getState().gems
    const xpAfterFirst = usePlayer.getState().xpTotal
    const trophiesAfterFirst = usePlayer.getState().battleTrophies

    usePlayer.getState().battleFinished(args)
    const s = usePlayer.getState()
    expect(s.battleCleared.filter((g: number) => g === 2).length).toBe(1)
    expect(s.gems).toBe(gemsAfterFirst + REPEAT_WIN_GEMS) // §13.4 anti-farm cap
    expect(s.xpTotal).toBe(xpAfterFirst) // no re-pay of player XP
    expect(s.battleTrophies).toBe(trophiesAfterFirst) // trophy is FIRST clear only
    expect(s.battleWins).toBe(2) // but the win still counts
    expect(s.cardBattleXp.tails).toBe(30) // repeatable levelling stacks
  })

  it('a loss pays only the tiny §13.1 consolation — no clear, no win, but banks card XP', () => {
    usePlayer.getState().battleFinished({
      gym: 3,
      won: false,
      gems: 26,
      xp: 50,
      perCardXp: { knuckles: 5 },
    })
    const s = usePlayer.getState()
    expect(s.battleCleared).not.toContain(3)
    expect(s.gems).toBe(1000 + LOSS_CONSOLATION_GEMS) // friendly consolation
    expect(s.xpTotal).toBe(0) // a loss never pays player XP
    expect(s.battleWins).toBe(0)
    expect(s.cardBattleXp.knuckles).toBe(5)
  })
})

describe('battleFinished — daily rival flag rolls with the day', () => {
  it('a stale day rolls forward on ANY battle (flag clears until a rival win)', () => {
    usePlayer.setState({ battleDailyBossDay: '2020-01-01', battleDailyBossDone: true })
    usePlayer.getState().battleFinished({
      gym: 1,
      won: false,
      gems: 0,
      xp: 0,
      perCardXp: {},
    })
    const s = usePlayer.getState()
    expect(s.battleDailyBossDay).toBe(todayISO())
    expect(s.battleDailyBossDone).toBe(false) // stale flag cleared on roll
  })

  it('only a DAILY RIVAL match marks today beaten — a normal gym win does not', () => {
    usePlayer.getState().battleFinished({ gym: 1, won: true, gems: 14, xp: 30, perCardXp: {} })
    expect(usePlayer.getState().battleDailyBossDone).toBe(false) // normal win ≠ rival

    usePlayer.getState().battleFinished({
      gym: 1,
      won: true,
      gems: 0,
      xp: 0,
      perCardXp: {},
      dailyRival: true,
    })
    expect(usePlayer.getState().battleDailyBossDone).toBe(true)
  })

  it('a Daily Rival rematch win pays ONE bonus gem on top of the repeat-win gems', () => {
    // Clear gym 1 first (so the rematch is a repeat win, not a first clear).
    usePlayer.getState().battleFinished({ gym: 1, won: true, gems: 14, xp: 30, perCardXp: {}, rng: () => 0 })
    const before = usePlayer.getState().gems
    usePlayer.getState().battleFinished({ gym: 1, won: true, gems: 0, xp: 0, perCardXp: {}, dailyRival: true })
    // repeat-win gems + daily-rival bonus gem
    expect(usePlayer.getState().gems).toBe(before + REPEAT_WIN_GEMS + DAILY_RIVAL_BONUS_GEMS)
    expect(usePlayer.getState().battleDailyBossDone).toBe(true)
  })

  it('the bonus gem is once-a-day: a second rival win the SAME day pays only repeat-win gems', () => {
    usePlayer.getState().battleFinished({ gym: 1, won: true, gems: 14, xp: 30, perCardXp: {}, rng: () => 0 })
    usePlayer.getState().battleFinished({ gym: 1, won: true, gems: 0, xp: 0, perCardXp: {}, dailyRival: true })
    const afterFirstRival = usePlayer.getState().gems
    usePlayer.getState().battleFinished({ gym: 1, won: true, gems: 0, xp: 0, perCardXp: {}, dailyRival: true })
    expect(usePlayer.getState().gems).toBe(afterFirstRival + REPEAT_WIN_GEMS) // no 2nd bonus
  })

  it('a losing Daily Rival pays only the consolation and does NOT mark today beaten', () => {
    usePlayer.getState().battleFinished({ gym: 1, won: true, gems: 14, xp: 30, perCardXp: {}, rng: () => 0 })
    const before = usePlayer.getState().gems
    usePlayer.getState().battleFinished({ gym: 1, won: false, gems: 0, xp: 0, perCardXp: {}, dailyRival: true })
    expect(usePlayer.getState().gems).toBe(before + LOSS_CONSOLATION_GEMS)
    expect(usePlayer.getState().battleDailyBossDone).toBe(false) // can retry today
  })
})

describe('R0 — battle progress never mutates lesson/XP/gems progress on its own', () => {
  it('a zero-reward first clear leaves lessonProgress/xpTotal untouched (gems move only by the victory chest)', () => {
    usePlayer.setState({
      lessonProgress: { u1l1: { crown: 2, bestAccuracy: 90, completions: 1 } },
      gems: 500,
      xpTotal: 120,
    })
    const chest = usePlayer.getState().battleFinished({
      gym: 5,
      won: true,
      gems: 0, // caller passed zero ⇒ no battle-gem payout
      xp: 0,
      perCardXp: {},
      rng: () => 0, // deterministic chest
    })
    const s = usePlayer.getState()
    expect(s.lessonProgress).toEqual({ u1l1: { crown: 2, bestAccuracy: 90, completions: 1 } })
    // WS23: the ONLY gem movement on a first clear is the victory chest's own
    // gems + duplicate dust (approved new grantChest caller) — never the
    // battle-gem prize.
    expect(s.gems).toBe(500 + (chest?.gems ?? 0) + (chest?.dust ?? 0))
    expect(s.xpTotal).toBe(120)
    expect(s.battleCleared).toContain(5) // battle-only state still progresses
  })

  it('a loss only moves the tiny §13.1 consolation — lessonProgress/xpTotal stay untouched', () => {
    usePlayer.setState({
      lessonProgress: { u1l1: { crown: 2, bestAccuracy: 90, completions: 1 } },
      gems: 500,
      xpTotal: 120,
    })
    usePlayer.getState().battleFinished({
      gym: 5,
      won: false,
      gems: 26,
      xp: 50,
      perCardXp: {},
    })
    const s = usePlayer.getState()
    expect(s.lessonProgress).toEqual({ u1l1: { crown: 2, bestAccuracy: 90, completions: 1 } })
    expect(s.xpTotal).toBe(120) // no player XP from a loss
    expect(s.gems).toBe(500 + LOSS_CONSOLATION_GEMS) // tiny consolation only
  })
})

describe('R0 — battle fields are LOCAL-ONLY (cloud sync never touches them)', () => {
  it('applySyncedSnapshot ignores battle fields even when a hostile snap carries them', () => {
    usePlayer.setState({
      battleCleared: [1, 2],
      battleWins: 7,
      battleTrophies: 9,
      battleSquad: ['sonic'],
      cardBattleXp: { sonic: 40 },
      battleDailyBossDone: true,
    })
    usePlayer.getState().applySyncedSnapshot({
      xpTotal: 9999,
      gems: 9999,
      // hostile/host values for battle fields must be dropped:
      battleCleared: [9, 10, 11],
      battleWins: 12345,
      battleTrophies: 12345,
      battleSquad: ['eggman'],
      cardBattleXp: { eggman: 999 },
      battleDailyBossDone: false,
    } as never)
    const s = usePlayer.getState()
    // synced progress DID apply:
    expect(s.xpTotal).toBe(9999)
    expect(s.gems).toBe(9999)
    // battle fields were NOT overwritten:
    expect(s.battleCleared).toEqual([1, 2])
    expect(s.battleWins).toBe(7)
    expect(s.battleTrophies).toBe(9)
    expect(s.battleSquad).toEqual(['sonic'])
    expect(s.cardBattleXp).toEqual({ sonic: 40 })
    expect(s.battleDailyBossDone).toBe(true)
  })

  it('every battle key is present in initial state (no undefined on fresh boot)', () => {
    const s = usePlayer.getState()
    for (const k of BATTLE_KEYS) {
      expect(s[k], `missing battle field ${k}`).toBeDefined()
    }
  })
})
