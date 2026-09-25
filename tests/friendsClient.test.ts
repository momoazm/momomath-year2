// Friends client unit tests with a mocked fetch (PLAN 18, step 85).
// The real service is covered by momolearn-ai's scripts/test-friends.mjs —
// these tests pin the CLIENT contract: URLs, payloads, error copy, fallbacks.
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FRIENDS_API,
  FriendsError,
  fetchFriends,
  fetchMyCode,
  joinFriend,
  regenerateMyCode,
} from '../src/engine/friends'

const OFFLINE = 'No internet right now — try again in a bit 🛜'

interface Call {
  url: string
  init?: RequestInit
}

let calls: Call[] = []

/** Stub global fetch; handler returns a JSON payload (or 'network' to reject). */
function stub(handler: (url: string, init?: RequestInit) => { ok?: boolean; body: unknown } | 'network') {
  calls = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      const r = handler(url, init)
      if (r === 'network') throw new TypeError('Failed to fetch')
      return { ok: r.ok ?? true, json: async () => r.body } as unknown as Response
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('friend code endpoints', () => {
  it('fetchMyCode POSTs playerId + name and returns the code', async () => {
    stub(() => ({ body: { ok: true, code: 'K7QPM3' } }))
    const code = await fetchMyCode('g:qa', 'Momo')
    expect(code).toBe('K7QPM3')
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe(`${FRIENDS_API}/code`)
    expect(calls[0].init?.method).toBe('POST')
    const body = JSON.parse(String(calls[0].init?.body))
    expect(body).toEqual({ playerId: 'g:qa', name: 'Momo' })
    const headers = calls[0].init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('regenerateMyCode sends regenerate: true', async () => {
    stub(() => ({ body: { ok: true, code: 'B2C3D4' } }))
    const code = await regenerateMyCode('g:qa', 'Momo')
    expect(code).toBe('B2C3D4')
    const body = JSON.parse(String(calls[0].init?.body))
    expect(body).toEqual({ playerId: 'g:qa', name: 'Momo', regenerate: true })
  })
})

describe('joinFriend (PLAN 83)', () => {
  it('maps the server payload into a JoinResult', async () => {
    stub(() => ({ body: { ok: true, friendName: 'Sara', friendId: 'name:sara', firstJoin: true, already: false } }))
    const r = await joinFriend('g:qa', 'Momo', 'K7QPM3')
    expect(r).toEqual({ friendName: 'Sara', friendId: 'name:sara', firstJoin: true, already: false })
    expect(calls[0].url).toBe(`${FRIENDS_API}/join`)
    const body = JSON.parse(String(calls[0].init?.body))
    expect(body).toEqual({ playerId: 'g:qa', name: 'Momo', code: 'K7QPM3' })
  })

  it('applies safe defaults for missing optional fields', async () => {
    stub(() => ({ body: { ok: true, friendName: 'Amir' } }))
    const r = await joinFriend('g:qa', 'Momo', 'B2C3D4')
    expect(r.friendName).toBe('Amir')
    expect(r.friendId).toBe('')
    expect(r.firstJoin).toBe(false)
    expect(r.already).toBe(false)
  })

  it('surfaces the server friendly error copy verbatim', async () => {
    stub(() => ({ ok: false, body: { ok: false, error: "That code doesn't match — check the letters!" } }))
    await expect(joinFriend('g:qa', 'Momo', 'ZZZZZZ')).rejects.toThrow(
      "That code doesn't match — check the letters!",
    )
  })
})

describe('error handling', () => {
  it('a network failure throws the offline FriendsError', async () => {
    stub(() => 'network')
    await expect(fetchMyCode('g:qa', 'Momo')).rejects.toThrow(OFFLINE)
    await expect(fetchMyCode('g:qa', 'Momo')).rejects.toBeInstanceOf(FriendsError)
  })

  it('a non-JSON response throws the offline FriendsError', async () => {
    calls = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => { throw new SyntaxError('bad json') } }) as unknown as Response),
    )
    await expect(fetchFriends('g:qa')).rejects.toThrow(OFFLINE)
  })

  it('a non-ok response without error copy falls back to offline copy', async () => {
    stub(() => ({ ok: false, body: {} }))
    await expect(regenerateMyCode('g:qa', 'Momo')).rejects.toThrow(OFFLINE)
  })
})

describe('fetchFriends normalisation', () => {
  it('keeps valid rows, drops junk, and clamps names', async () => {
    stub(() => ({
      body: {
        ok: true,
        friends: [
          { id: 'name:sara', name: 'Sara' },
          { id: 'g:amir', name: '' },
          { name: 'NoIdHere' },
          null,
          { id: 'g:long', name: 'X'.repeat(40) },
        ],
      },
    }))
    const rows = await fetchFriends('g:qa')
    expect(rows).toEqual([
      { id: 'name:sara', name: 'Sara' },
      { id: 'g:amir', name: 'Champion' },
      { id: 'g:long', name: 'X'.repeat(24) },
    ])
  })

  it('returns [] when the payload is not a list', async () => {
    stub(() => ({ body: { ok: true, friends: 'nope' } }))
    expect(await fetchFriends('g:qa')).toEqual([])
  })

  it('url-encodes the playerId on the list query', async () => {
    stub(() => ({ body: { ok: true, friends: [] } }))
    await fetchFriends('name:momo learner')
    expect(calls[0].url).toBe(`${FRIENDS_API}/list?playerId=name%3Amomo%20learner`)
  })
})
