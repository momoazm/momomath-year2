import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exchangeSession, getSession, signInWithGoogle, useAuth } from '../src/engine/auth'
import { usePlayer } from '../src/engine/store'

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

const serverUser = { sub: 'google-sub-9', name: 'Test Kid', email: 'kid@test.dev' }

beforeEach(() => {
  useAuth.getState().signOut()
})

afterEach(() => {
  vi.unstubAllGlobals()
  useAuth.getState().signOut()
})

describe('exchangeSession: one Google tap becomes a long-lived session', () => {
  it('POSTs the Google token once and returns the server session', async () => {
    const seen: unknown[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        seen.push(JSON.parse(String(init?.body)))
        return jsonResponse({ ok: true, session: 'sess-abc', expiresAt: 9999999999999, user: serverUser })
      }),
    )
    const r = await exchangeSession('google-id-token-once')
    expect(r.session).toBe('sess-abc')
    expect(r.user.sub).toBe('google-sub-9')
    // The raw Google token goes out exactly once and is never stored.
    expect(seen).toEqual([{ idToken: 'google-id-token-once' }])
    expect(useAuth.getState().session).toBeNull()
  })

  it('throws on HTTP failure so the button can show a retry', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: false }, 401)))
    await expect(exchangeSession('bad')).rejects.toThrow()
  })

  it('throws when the server refuses the token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: false, error: 'nope' })))
    await expect(exchangeSession('bad')).rejects.toThrow('session-rejected')
  })
})

describe('getSession', () => {
  it('returns the session while valid, null when missing or past expiry', () => {
    expect(getSession()).toBeNull()
    useAuth.setState({ user: serverUser, session: 's1', sessionExp: Date.now() + 1000 })
    expect(getSession()).toBe('s1')
    useAuth.setState({ sessionExp: Date.now() - 1000 })
    expect(getSession()).toBeNull()
  })
})

describe('signInWithGoogle', () => {
  it('signs in with the server user + session and onboards the profile', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ ok: true, session: 'sess-abc', expiresAt: Date.now() + 1000, user: serverUser })),
    )
    usePlayer.setState({ name: 'Champion', onboarded: false })
    expect(await signInWithGoogle('one-time-token')).toBe(true)
    const a = useAuth.getState()
    expect(a.user?.sub).toBe('google-sub-9')
    expect(a.session).toBe('sess-abc')
    // First-name default applied, onboarding completed.
    expect(usePlayer.getState().name).toBe('Test')
    expect(usePlayer.getState().onboarded).toBe(true)
  })

  it('returns false and signs nobody in when the exchange fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: false }, 503)))
    expect(await signInWithGoogle('bad')).toBe(false)
    expect(useAuth.getState().user).toBeNull()
  })
})
