import { describe, expect, it } from 'vitest'
import { migratePersisted, freshYearSlice, usePlayer } from '../src/engine/store'

const LP = { e1l1: { crown: 3, bestAccuracy: 92, completions: 4 } }

function v15Fixture(): Record<string, unknown> {
  return {
    name: 'Fixture Kid',
    guestId: 'guest:abc',
    subject: 'german',
    germanEnabled: true,
    arabicEnabled: false,
    religionEnabled: false,
    socialEnabled: false,
    lessonProgress: LP,
    arcadeScores: { 'math-run': 120 },
    sprintBest: 55,
    xpTotal: 400,
    gems: 90,
  }
}

/** PLAN Phase 31 step 158 — store v16 year system. */
describe('PLAN 158 — store v16 year system', () => {
  it('migrates a full v15 fixture to Year 2 with paths[2] relocation', () => {
    const m = migratePersisted(v15Fixture() as never, 15)
    expect(m.yearLevel).toBe(2)
    // German alone must NOT unlock the arabic/religion/social trio
    expect(m.extrasUnlocked).toBe(false)
    expect(m.paths?.[2]).toEqual({
      lessonProgress: LP,
      subject: 'german',
      arcadeScores: { 'math-run': 120 },
      sprintBest: 55,
    })
    // top-level fields stay put — the active (Year-2) view is unchanged
    expect(m.lessonProgress).toBe(LP)
    expect(m.sprintBest).toBe(55)
    expect(m.xpTotal).toBe(400)
  })

  it('grandfathers the trio on when any *Enabled flag is already set', () => {
    const withArabic = migratePersisted({ ...v15Fixture(), arabicEnabled: true } as never, 15)
    expect(withArabic.extrasUnlocked).toBe(true)
    const withSocial = migratePersisted({ ...v15Fixture(), socialEnabled: true } as never, 15)
    expect(withSocial.extrasUnlocked).toBe(true)
    const none = migratePersisted(
      { ...v15Fixture(), germanEnabled: false, arabicEnabled: false } as never,
      15,
    )
    expect(none.extrasUnlocked).toBe(false)
  })

  it('migration never clobbers a valid newer yearLevel', () => {
    const m = migratePersisted({ ...v15Fixture(), yearLevel: 3 } as never, 15)
    expect(m.yearLevel).toBe(3)
    // paths[2] still holds the legacy data for when they switch back
    expect(m.paths?.[2]?.lessonProgress).toEqual(LP)
  })

  it('fresh install defaults to Year 2 with a mirrored empty bucket', () => {
    const s = usePlayer.getState()
    expect(s.yearLevel).toBe(2)
    expect(s.extrasUnlocked).toBe(false)
    expect(s.paths?.[2]).toEqual({
      lessonProgress: {},
      subject: s.subject,
      arcadeScores: {},
      sprintBest: 0,
    })
  })

  it('freshYearSlice is the single source of fresh defaults', () => {
    expect(freshYearSlice('science', true)).toEqual({
      yearLevel: 2,
      extrasUnlocked: true,
      paths: { 2: { lessonProgress: {}, subject: 'science', arcadeScores: {}, sprintBest: 0 } },
    })
  })

  it('actions mirror into paths[active] and setYearLevel isolates buckets', () => {
    const s = usePlayer.getState()
    s.completeLesson({
      lessonId: 'e1l1',
      xp: 12,
      correct: 5,
      totalQuestions: 5,
      crownsGained: 1,
      accuracy: 100,
    })
    s.finishSprint(40)
    let st = usePlayer.getState()
    expect(st.paths?.[2]?.lessonProgress?.e1l1?.completions).toBe(1)
    expect(st.paths?.[2]?.sprintBest).toBe(40)

    // Year 3 starts empty
    st.setYearLevel(3)
    st = usePlayer.getState()
    expect(st.yearLevel).toBe(3)
    expect(Object.keys(st.lessonProgress)).toHaveLength(0)
    expect(st.sprintBest).toBe(0)
    expect(st.paths?.[3]).toEqual({
      lessonProgress: {},
      subject: 'math',
      arcadeScores: {},
      sprintBest: 0,
    })
    // Year 2 bucket untouched
    expect(st.paths?.[2]?.lessonProgress?.e1l1?.completions).toBe(1)
    expect(st.paths?.[2]?.sprintBest).toBe(40)

    // roadmap position written in Y3 stays in Y3
    st.setSubject('english')
    expect(usePlayer.getState().paths?.[3]?.subject).toBe('english')
    expect(usePlayer.getState().paths?.[2]?.subject).toBe(st.paths?.[2]?.subject)

    // back to Year 2 — everything restored
    st.setYearLevel(2)
    st = usePlayer.getState()
    expect(st.yearLevel).toBe(2)
    expect(st.lessonProgress.e1l1.completions).toBe(1)
    expect(st.sprintBest).toBe(40)
    expect(st.subject).toBe('math')
    expect(st.paths?.[3]?.subject).toBe('english')
  })
})
