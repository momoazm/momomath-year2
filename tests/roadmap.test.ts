import { describe, expect, it } from 'vitest'
import { migratePersisted, usePlayer } from '../src/engine/store'
import { ENGLISH_UNITS } from '../src/content/english'
import { kindFor, KIND_ICON } from '../src/screens/PathScreen'
import { isLessonUnlocked } from '../src/engine/path'
import { ACHIEVEMENTS, type AchievementSnapshot } from '../src/engine/gamification'

describe('finishBook reward (PLAN 15)', () => {
  it('grants +20 gems exactly once per book', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ gems: 100, booksRead: {} })
    usePlayer.getState().finishBook('bk-e1')
    expect(usePlayer.getState().gems).toBe(120)
    expect(usePlayer.getState().booksRead['bk-e1']).toBe(true)
    usePlayer.getState().finishBook('bk-e1')
    expect(usePlayer.getState().gems).toBe(120)
    expect(usePlayer.getState().booksRead['bk-e1']).toBe(true)
    usePlayer.setState({ gems: 100, booksRead: { ...st.booksRead } })
  })
})

describe('celebrateUnit reward (PLAN 76)', () => {
  it('grants +30 gems exactly once per unit', () => {
    usePlayer.setState({ gems: 100, unitsCelebrated: [] })
    usePlayer.getState().celebrateUnit('e1')
    expect(usePlayer.getState().gems).toBe(130)
    expect(usePlayer.getState().unitsCelebrated).toContain('e1')
    usePlayer.getState().celebrateUnit('e1')
    expect(usePlayer.getState().gems).toBe(130)
    expect(usePlayer.getState().unitsCelebrated.filter((u) => u === 'e1')).toHaveLength(1)
    usePlayer.setState({ gems: 120, unitsCelebrated: [] })
  })
})

describe('roadmap node typing (PLAN 78)', () => {
  it('boss ids map to boss kind, everything else to lesson', () => {
    for (const u of ENGLISH_UNITS) {
      for (const l of u.lessons) {
        expect(kindFor(l), l.id).toBe(l.id.endsWith('boss') ? 'boss' : 'lesson')
      }
    }
  })
  it('every kind has a distinct emoji icon', () => {
    const icons = Object.values(KIND_ICON)
    expect(new Set(icons).size).toBe(icons.length)
    expect(KIND_ICON.practice).toBe('🔁')
    expect(KIND_ICON.book).toBe('📖')
    expect(KIND_ICON.activity).toBe('🎯')
  })
})

describe('persist migration backfills v12 fields (PLAN 18 step 85)', () => {
  it('a v11 save gains empty booksRead + unitsCelebrated without losing data', () => {
    const old = { name: 'Momo', gems: 55, subject: 'english', xpTotal: 900 } as never
    const m = migratePersisted(old, 11)
    expect(m.booksRead).toEqual({})
    expect(m.unitsCelebrated).toEqual([])
    expect(m.gems).toBe(55)
    expect(m.xpTotal).toBe(900)
  })

  it('corrupt v11 fields are repaired, valid ones kept', () => {
    const old = { booksRead: 'nope', unitsCelebrated: { a: 1 } } as never
    const m = migratePersisted(old, 11)
    expect(m.booksRead).toEqual({})
    expect(m.unitsCelebrated).toEqual([])
    const keep = { booksRead: { 'bk-e1': true }, unitsCelebrated: ['e1'] } as never
    const m2 = migratePersisted(keep, 11)
    expect(m2.booksRead).toEqual({ 'bk-e1': true })
    expect(m2.unitsCelebrated).toEqual(['e1'])
  })

  it('a current-version save passes through untouched', () => {
    const cur = { booksRead: { 'bk-e2': true }, unitsCelebrated: ['e2'], friendsAdded: 3, gems: 7 } as never
    const m = migratePersisted(cur, 12)
    expect(m.booksRead).toEqual({ 'bk-e2': true })
    expect(m.unitsCelebrated).toEqual(['e2'])
    expect(m.friendsAdded).toBe(3)
    expect(m.gems).toBe(7)
  })

  it('a v11 save gains friendsAdded: 0', () => {
    const m = migratePersisted({ gems: 10 } as never, 11)
    expect(m.friendsAdded).toBe(0)
    const bad = migratePersisted({ friendsAdded: 'x' } as never, 11)
    expect(bad.friendsAdded).toBe(0)
  })
})

describe('practice node derivation (PLAN 77)', () => {
  it('weakest lesson = lowest bestAccuracy, first on tie', () => {
    const u = ENGLISH_UNITS[0]
    const progress: Record<string, { completions: number; bestAccuracy: number }> = {}
    for (const l of u.lessons) progress[l.id] = { completions: 1, bestAccuracy: 100 }
    const weakest = u.lessons.reduce((a, b) =>
      (progress[a.id]?.bestAccuracy ?? 0) <= (progress[b.id]?.bestAccuracy ?? 0) ? a : b,
    )
    expect(weakest.id).toBe(u.lessons[0].id) // all tie at 100 → first wins
    progress[u.lessons[2].id] = { completions: 1, bestAccuracy: 61 }
    const weakest2 = u.lessons.reduce((a, b) =>
      (progress[a.id]?.bestAccuracy ?? 0) <= (progress[b.id]?.bestAccuracy ?? 0) ? a : b,
    )
    expect(weakest2.id).toBe(u.lessons[2].id)
  })

  it('allTried unlock gate: every lesson needs completions >= 1', () => {
    const u = ENGLISH_UNITS[1]
    const progress: Record<string, { completions: number; bestAccuracy: number }> = {}
    for (const l of u.lessons) progress[l.id] = { completions: 1, bestAccuracy: 50 }
    const allTried = (p: typeof progress) => u.lessons.every((l) => (p[l.id]?.completions ?? 0) > 0)
    expect(allTried(progress)).toBe(true)
    progress[u.lessons[3].id] = { completions: 0, bestAccuracy: 0 }
    expect(allTried(progress)).toBe(false)
  })
})

describe('persist migration backfills v13 fields (PLAN 22 step 104)', () => {
  it('a v12 save gains an empty unitActivityBest without losing data', () => {
    const old = { name: 'Momo', gems: 55, subject: 'english', xpTotal: 900 } as never
    const m = migratePersisted(old, 12)
    expect(m.unitActivityBest).toEqual({})
    expect(m.gems).toBe(55)
    expect(m.xpTotal).toBe(900)
  })

  it('corrupt v13 fields are repaired, valid ones kept', () => {
    const m = migratePersisted({ unitActivityBest: 'nope' } as never, 12)
    expect(m.unitActivityBest).toEqual({})
    const m2 = migratePersisted({ unitActivityBest: { e1: 5 } } as never, 12)
    expect(m2.unitActivityBest).toEqual({ e1: 5 })
  })
})

describe('recordUnitActivity reward (PLAN 104)', () => {
  it('pays correct×4 XP always and gems on a new best (5 perfect, else 2)', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ gems: 0, xpTotal: 0, todayXp: 0, todayXpDay: '', weeklyXp: 0, weeklyXpWeek: '', unitActivityBest: {} })
    const r1 = usePlayer.getState().recordUnitActivity('e1', 6, 8)
    expect(r1).toEqual({ xp: 24, gems: 2 })
    expect(usePlayer.getState().unitActivityBest['e1']).toBe(6)
    expect(usePlayer.getState().gems).toBe(2)
    // worse run: XP still flows, but no gems and the best stays
    const r2 = usePlayer.getState().recordUnitActivity('e1', 4, 8)
    expect(r2).toEqual({ xp: 16, gems: 0 })
    expect(usePlayer.getState().unitActivityBest['e1']).toBe(6)
    // perfect new best: +5 gems
    const r3 = usePlayer.getState().recordUnitActivity('e1', 8, 8)
    expect(r3).toEqual({ xp: 32, gems: 5 })
    expect(usePlayer.getState().unitActivityBest['e1']).toBe(8)
    usePlayer.setState({ gems: st.gems, xpTotal: st.xpTotal, todayXp: st.todayXp, todayXpDay: st.todayXpDay, weeklyXp: st.weeklyXp, weeklyXpWeek: st.weeklyXpWeek, unitActivityBest: { ...st.unitActivityBest } })
  })
})

describe('unit book unlock rule (PLAN 15/step 85)', () => {
  it('book unlocks with the first lesson of its unit (isLessonUnlocked(ui, 0))', () => {
    const units = ENGLISH_UNITS
    // fresh player: only unit 1's book is open
    expect(isLessonUnlocked(0, 0, {}, units)).toBe(true)
    for (let ui = 1; ui < units.length; ui++) {
      expect(isLessonUnlocked(ui, 0, {}, units), `unit ${ui} book on fresh save`).toBe(false)
    }
    // finishing unit 1's boss (flat predecessor of unit 2 lesson 1) opens unit 2's book
    const u1Last = units[0].lessons[units[0].lessons.length - 1]
    const progress = { [u1Last.id]: { completions: 1, bestAccuracy: 100 } }
    expect(isLessonUnlocked(1, 0, progress, units)).toBe(true)
    expect(isLessonUnlocked(2, 0, progress, units)).toBe(false)
  })
})

describe('teach fallback (PLAN 14/step 85)', () => {
  it('lesson.teach ?? [intro.body] is always non-empty (BattleScreen guide lines)', () => {
    for (const u of ENGLISH_UNITS) {
      for (const l of u.lessons) {
        const guideLines = l.teach ?? [l.intro.body]
        expect(guideLines.length, l.id).toBeGreaterThan(0)
        expect(guideLines[0].trim().length, l.id).toBeGreaterThan(0)
      }
    }
    // a lesson WITHOUT teach still yields exactly [intro.body]
    const noTeach = ENGLISH_UNITS[0].lessons[0]
    const saved = noTeach.teach
    delete noTeach.teach
    expect(noTeach.teach ?? [noTeach.intro.body]).toEqual([noTeach.intro.body])
    if (saved) noTeach.teach = saved
  })
})

describe('recordFriendJoin reward (PLAN 83/step 85)', () => {
  it('first friend: +30 gems + made-a-friend; later friends only increment the counter', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ gems: 100, friendsAdded: 0, achievements: [] })
    usePlayer.getState().recordFriendJoin()
    expect(usePlayer.getState().gems).toBe(130)
    expect(usePlayer.getState().friendsAdded).toBe(1)
    expect(usePlayer.getState().achievements).toContain('made-a-friend')
    usePlayer.getState().recordFriendJoin()
    expect(usePlayer.getState().gems).toBe(130) // reward is one-time
    expect(usePlayer.getState().friendsAdded).toBe(2)
    usePlayer.setState({ gems: 120, friendsAdded: 0, achievements: st.achievements })
  })

  it('made-a-friend achievement exists and tests friendsAdded >= 1', () => {
    const def = ACHIEVEMENTS.find((a) => a.id === 'made-a-friend')
    expect(def).toBeTruthy()
    expect(def!.title).toBe('Best Friends')
    const snap = { friendsAdded: 1 } as AchievementSnapshot
    expect(def!.test(snap)).toBe(true)
    expect(def!.test({ friendsAdded: 0 } as AchievementSnapshot)).toBe(false)
  })
})
