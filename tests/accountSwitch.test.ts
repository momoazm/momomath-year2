import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __setAccountKVForTests,
  accountPullMode,
  readAccountCache,
  readOwnerSub,
  snapshotFromPlayer,
  writeAccountCache,
  writeOwnerSub,
  type AccountKV,
} from '../src/engine/cloudsave'
import { usePlayer } from '../src/engine/store'

type State = ReturnType<typeof usePlayer.getState>

function fakeKV(): AccountKV {
  const map = new Map<string, string>()
  return {
    get: (k) => map.get(k) ?? null,
    set: (k, v) => void map.set(k, v),
    remove: (k) => void map.delete(k),
    keys: () => [...map.keys()],
  }
}

beforeEach(() => {
  __setAccountKVForTests(fakeKV())
})

afterEach(() => {
  vi.restoreAllMocks()
  __setAccountKVForTests(null)
})

describe('accountPullMode', () => {
  it('treats first sign-in and same-account re-sign-in as merge', () => {
    expect(accountPullMode(null, 'sub-a')).toBe('merge')
    expect(accountPullMode('', 'sub-a')).toBe('merge')
    expect(accountPullMode('sub-a', 'sub-a')).toBe('merge')
  })

  it('treats a different Google sub as switch', () => {
    expect(accountPullMode('sub-a', 'sub-b')).toBe('switch')
    expect(accountPullMode('sub-a', 'sub-c')).toBe('switch')
  })
})

describe('owner sub', () => {
  it('round-trips through the KV', () => {
    expect(readOwnerSub()).toBeNull()
    writeOwnerSub('sub-a')
    expect(readOwnerSub()).toBe('sub-a')
    writeOwnerSub('sub-b')
    expect(readOwnerSub()).toBe('sub-b')
  })

  it('is null-safe without storage (SSR / storage-less envs)', () => {
    __setAccountKVForTests(null)
    expect(readOwnerSub()).toBeNull()
    expect(() => writeOwnerSub('sub-a')).not.toThrow()
    expect(readAccountCache('sub-a')).toBeNull()
  })
})

describe('per-account cache', () => {
  it('round-trips a snapshot per account', () => {
    const base = snapshotFromPlayer(usePlayer.getState())
    writeAccountCache('sub-a', { ...base, name: 'Alice' })
    writeAccountCache('sub-b', { ...base, name: 'Bob' })
    expect(readAccountCache('sub-a')?.name).toBe('Alice')
    expect(readAccountCache('sub-b')?.name).toBe('Bob')
    expect(readAccountCache('sub-never-written')).toBeNull()
  })

  it('ignores corrupt cache entries instead of crashing', () => {
    writeAccountCache('sub-a', { ...snapshotFromPlayer(usePlayer.getState()), name: 'A' })
    // Simulate on-disk corruption via a raw key write.
    const store = fakeKV()
    __setAccountKVForTests(store)
    store.set('momomath-year2-account:sub-a', '{not json')
    expect(readAccountCache('sub-a')).toBeNull()
  })

  it('evicts the oldest account beyond 6 cached accounts', () => {
    const base = snapshotFromPlayer(usePlayer.getState())
    let now = 1_000
    const spy = vi.spyOn(Date, 'now').mockImplementation(() => (now += 1_000))
    for (let i = 1; i <= 7; i++) writeAccountCache(`sub-${i}`, { ...base, name: `N${i}` })
    spy.mockRestore()
    expect(readAccountCache('sub-1')).toBeNull()
    expect(readAccountCache('sub-2')?.name).toBe('N2')
    expect(readAccountCache('sub-7')?.name).toBe('N7')
  })
})

describe('resetForNewAccount', () => {
  it('returns every data field to pristine install state', () => {
    const pristine = usePlayer.getState()

    // Pollute every non-function field: numbers, strings, booleans, nulls,
    // arrays and objects all get something obviously wrong. `paths` also gets
    // stale per-year buckets the reset must clear.
    usePlayer.setState((state) => {
      const mutated: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(state)) {
        if (typeof v === 'function') continue
        if (typeof v === 'number') mutated[k] = v + 123
        else if (typeof v === 'boolean') mutated[k] = !v
        else if (typeof v === 'string') mutated[k] = v + '!'
        else if (v === null) mutated[k] = 'polluted'
        else if (Array.isArray(v)) mutated[k] = ['polluted']
        else mutated[k] = { ...(v as object), polluted: true }
      }
      mutated['paths'] = { 1: { polluted: 1 }, 2: { polluted: 2 }, 3: { polluted: 3 }, 4: { polluted: 4 } }
      return mutated as unknown as Partial<State>
    })

    expect(usePlayer.getState().soundOn).toBe(false)
    usePlayer.getState().resetForNewAccount()
    const after = usePlayer.getState()

    for (const [k, v] of Object.entries(pristine)) {
      if (typeof v === 'function') continue
      if (k === 'guestId' || k === 'soundOn') continue
      expect(after[k as keyof State], `field: ${k}`).toEqual(v)
    }

    // Fresh random guest id (the polluted one is gone).
    expect(after.guestId).toMatch(/^guest:/)
    expect(after.guestId).not.toContain('!')
    // Device pref (sound) survives the account switch.
    expect(after.soundOn).toBe(false)
    // Stale year buckets cleared - only the fresh year slice remains.
    expect(Object.keys(after.paths)).toEqual(['2'])
    expect(after.paths[2]).toEqual(pristine.paths[2])
  })

  it('marks the account as not onboarded so the gate re-offers setup', () => {
    usePlayer.setState({ onboarded: true, name: 'Old Profile' })
    usePlayer.getState().resetForNewAccount()
    expect(usePlayer.getState().onboarded).toBe(false)
    expect(usePlayer.getState().name).toBe('Champion')
  })
})
