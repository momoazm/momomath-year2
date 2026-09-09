import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { useAuth } from '../src/engine/auth'
import { usePlayer } from '../src/engine/store'
import { syncNow, useSyncStatus, CloudAuthError, type CloudSave } from '../src/engine/cloudsave'

function remoteSave(overrides: Partial<CloudSave> = {}): CloudSave {
  return {
    name: 'CloudKid',
    mascot: 'shadow',
    subject: 'math',
    xpTotal: 500,
    gems: 200,
    streakCurrent: 6,
    streakLongest: 9,
    lastActiveDay: '2026-08-24',
    dailyGoal: 30,
    weeklyXpWeek: '2026-08-24',
    weeklyXp: 120,
    currentLeague: 'Silver',
    leagueHistory: [],
    lessonProgress: { l9: { crown: 3, bestAccuracy: 100, completions: 2 } },
    achievements: ['cloud-ace'],
    cardStars: { shadow: 1 },
    shopInventory: {},
    streakSavers: 1,
    doubleXpLessons: 0,
    luckyTickets: 0,
    updatedAt: 5000,
    ...overrides,
  }
}

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

beforeEach(() => {
  useAuth.setState({
    user: { sub: 'google-sub-1', name: 'Test Kid', email: 'kid@test.dev', picture: undefined },
    credential: 'test-credential',
  })
  usePlayer.setState({
    name: 'LocalKid',
    xpTotal: 900,
    gems: 10,
    achievements: ['local-star'],
    cardStars: { sonic: 2 },
    lessonProgress: { l1: { crown: 1, bestAccuracy: 70, completions: 1 } },
    lastSyncedAt: null,
  })
  useSyncStatus.setState({ status: 'signed-out', detail: '' })
})

afterEach(() => {
  vi.unstubAllGlobals()
  useAuth.getState().signOut()
})

describe('syncNow: same Google account across devices', () => {
  it('pulls the cloud save, merges both devices, pushes the union', async () => {
    const remote = remoteSave()
    const puts: unknown[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          puts.push(JSON.parse(String(init.body)))
          const body = JSON.parse(String(init.body)) as { save: CloudSave }
          return jsonResponse({ ok: true, save: body.save })
        }
        return jsonResponse({ ok: true, save: remote })
      }),
    )

    await syncNow()

    // Local store now holds the union of both devices.
    const s = usePlayer.getState()
    expect(s.xpTotal).toBe(900) // local max wins
    expect(s.gems).toBe(200) // cloud max wins
    expect(s.achievements).toEqual(expect.arrayContaining(['local-star', 'cloud-ace']))
    expect(s.cardStars).toEqual(expect.objectContaining({ sonic: 2, shadow: 1 }))
    expect(s.lessonProgress.l9).toEqual({ crown: 3, bestAccuracy: 100, completions: 2 })
    expect(s.lessonProgress.l1).toEqual({ crown: 1, bestAccuracy: 70, completions: 1 })
    expect(s.lastSyncedAt).not.toBeNull()

    // The push back to the server carried the converged union too.
    expect(puts).toHaveLength(1)
    const pushed = (puts[0] as { save: CloudSave }).save
    expect(pushed.achievements).toEqual(expect.arrayContaining(['local-star', 'cloud-ace']))
    expect(pushed.xpTotal).toBe(900)

    expect(useSyncStatus.getState().status).toBe('synced')
  })

  it('sends the Google credential as a Bearer token', async () => {
    const seen: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        seen.push((init?.headers as Record<string, string>)['Authorization'])
        return jsonResponse({ ok: true, save: null })
      }),
    )
    await syncNow()
    expect(seen.length).toBeGreaterThan(0)
    expect(seen.every((h) => h === 'Bearer test-credential')).toBe(true)
  })

  it('first run with no cloud save just uploads local progress', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true, save: null })))
    await syncNow()
    const s = usePlayer.getState()
    expect(s.xpTotal).toBe(900)
    expect(s.achievements).toContain('local-star')
    expect(useSyncStatus.getState().status).toBe('synced')
  })

  it('expired Google session surfaces the expired status (user signs in again)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: false }, 401)))
    await expect(syncNow()).rejects.toBeInstanceOf(CloudAuthError)
    expect(useSyncStatus.getState().status).toBe('expired')
    // Local progress is untouched by the failed sync.
    expect(usePlayer.getState().xpTotal).toBe(900)
  })

  it('offline failure keeps local progress and reports error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    await expect(syncNow()).rejects.toThrow('network down')
    expect(useSyncStatus.getState().status).toBe('error')
    expect(usePlayer.getState().xpTotal).toBe(900)
  })
})
