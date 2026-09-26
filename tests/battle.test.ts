import { describe, expect, it } from 'vitest'
import {
  answerBattle,
  battleAccuracy,
  createBattle,
  type BattleState,
} from '../src/engine/battle'
import { questionKey } from '../src/content/lessonQueue'

function mkBattle(kind: 'lesson' | 'boss' = 'lesson'): BattleState {
  const lessonId = kind === 'boss' ? 'u1boss' : 'u1l1'
  const st = createBattle(
    {
      kind,
      subject: 'math',
      lessonId,
      enemyName: 'Test Bot',
      mascotId: 'none',
    },
    42,
  )
  if (!st) throw new Error('createBattle failed — lesson not found: ' + lessonId)
  return st
}

describe('createBattle', () => {
  it('builds a 10-question lesson battle with full HP on both sides', () => {
    const b = mkBattle('lesson')
    expect(b.questions).toHaveLength(10)
    expect(b.playerHp).toBe(b.playerHpMax)
    expect(b.enemyHp).toBe(b.enemyHpMax)
    expect(b.status).toBe('active')
  })

  it('boss has a bigger HP pool (150) and tougher enemy hit', () => {
    const b = mkBattle('boss')
    expect(b.enemyHpMax).toBe(150)
    expect(b.questions).toHaveLength(10)
  })

  it('returns null for an unknown lesson id', () => {
    const st = createBattle(
      { kind: 'lesson', subject: 'math', lessonId: 'nope', enemyName: 'X', mascotId: 'none' },
      1,
    )
    expect(st).toBeNull()
  })
})

describe('Prodigy loop reducer', () => {
  it('correct answer damages the enemy and builds charge', () => {
    const b = mkBattle()
    const n = answerBattle(b, true)
    expect(n.enemyHp).toBeLessThan(b.enemyHp)
    expect(n.charge).toBe(1)
    expect(n.correct).toBe(1)
    expect(n.playerHp).toBe(b.playerHp)
  })

  it('third consecutive correct fires a SPECIAL (2.5x) and resets charge', () => {
    let b = mkBattle()
    b = answerBattle(b, true)
    b = answerBattle(b, true)
    const after = answerBattle(b, true)
    expect(after.charge).toBe(0)
    expect(after.lastFeedback?.special).toBe(true)
    const dmgSpecial = mkBattle().enemyHp - after.enemyHp
    expect(dmgSpecial).toBeGreaterThanOrEqual(25)
  })

  it('wrong answer = miss turn: enemy hits you, you deal no damage', () => {
    const b = mkBattle()
    const n = answerBattle(b, false, 'Try again')
    expect(n.enemyHp).toBe(b.enemyHp)
    expect(n.playerHp).toBeLessThan(b.playerHp)
    expect(n.wrong).toBe(1)
    expect(n.charge).toBe(0)
    expect(n.streak).toBe(0)
  })

  it('player HP 0 = lost (free retry status), not crash', () => {
    let b = mkBattle()
    // lesson enemy hit = 7, player 60 → 9 wrongs to die
    for (let i = 0; i < 12 && b.status === 'active'; i++) b = answerBattle(b, false)
    expect(b.status).toBe('lost')
    expect(b.playerHp).toBe(0)
  })

  it('winning: enemy HP reaches 0', () => {
    let b = mkBattle()
    for (let i = 0; i < 20 && b.status === 'active'; i++) b = answerBattle(b, true)
    expect(b.status).toBe('won')
    expect(b.enemyHp).toBe(0)
  })

  it('question exhaustion REFILLS — battle never ends on accuracy', () => {
    let b = mkBattle()
    const pattern = [true, true, false, true, true, false, true, true, false, false]
    for (const ok of pattern) {
      if (b.status !== 'active') break
      b = answerBattle(b, ok)
    }
    expect(b.correct).toBe(6)
    expect(b.wrong).toBe(4)
    expect(b.status).toBe('active')
    expect(b.questions.length).toBeGreaterThan(10)
    expect(battleAccuracy(b)).toBeCloseTo(0.6)
  })

  it('refilled batches never repeat a question the player already saw (PLAN 127)', () => {
    let b = mkBattle()
    // survive past the first batch so a refill appends
    b = { ...b, enemyHp: 9999, enemyHpMax: 9999, playerHp: 9999, playerHpMax: 9999 }
    for (let i = 0; i < 14 && b.status === 'active'; i++) b = answerBattle(b, true)
    expect(b.questions.length).toBeGreaterThan(10)
    const keys = b.questions.map(questionKey)
    expect(new Set(keys).size, 'a refilled batch repeated an already-served question').toBe(keys.length)
  })

  it('keeps refilling for many batches when HP cannot decide', () => {
    let b = mkBattle()
    b = {
      ...b,
      questions: b.questions.slice(0, 1),
      index: 0,
      enemyHp: 9999,
      enemyHpMax: 9999,
      playerHp: 9999,
      playerHpMax: 9999,
    }
    b = answerBattle(b, true)
    expect(b.status).toBe('active')
    expect(b.questions.length).toBeGreaterThan(1)
    for (let i = 0; i < 60 && b.status === 'active'; i++) b = answerBattle(b, true)
    expect(b.status).toBe('active')
    expect(b.questions.length).toBeGreaterThan(10)
    expect(b.enemyHp).toBeLessThan(9999)
  })

  it('answers after the battle ends are ignored', () => {
    let b = mkBattle()
    for (let i = 0; i < 20 && b.status === 'active'; i++) b = answerBattle(b, true)
    expect(b.status).toBe('won')
    const frozen = answerBattle(b, false)
    expect(frozen).toBe(b)
  })
})
