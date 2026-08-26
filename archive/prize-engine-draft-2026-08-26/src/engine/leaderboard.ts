// Leaderboard sync with jsonblob.com (free, no auth, CORS enabled)
// Stores weekly leaderboard: [{ name, xp, league, mascot, updated }]

export interface LeaderboardEntry {
  name: string
  xp: number
  league: string
  mascot: string
  updated: string // ISO date
}

const JSONBLOB_BASE = 'https://jsonblob.com/api/jsonBlob'
const LEADERBOARD_KEY = 'momomath-year2-leaderboard'

let cachedBlobId: string | null = null

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    let blobId = cachedBlobId
    
    // Try cached ID first
    if (blobId) {
      const res = await fetch(`${JSONBLOB_BASE}/${blobId}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        return Array.isArray(data) ? data : []
      }
    }

    // No cached ID or failed - try to find/create
    // We'll need to create on first write
    return []
  } catch {
    return []
  }
}

export async function saveLeaderboard(entries: LeaderboardEntry[]): Promise<boolean> {
  try {
    // Sort by XP descending
    const sorted = [...entries].sort((a, b) => b.xp - a.xp).slice(0, 100)
    
    if (cachedBlobId) {
      const res = await fetch(`${JSONBLOB_BASE}/${cachedBlobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sorted),
      })
      if (res.ok) return true
    }

    // Create new blob
    const res = await fetch(`${JSONBLOB_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sorted),
    })
    
    if (res.ok) {
      const data = await res.json()
      if (data.url) {
        cachedBlobId = data.url.split('/').pop() || null
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

export async function upsertMyEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
  const current = await getLeaderboard()
  const filtered = current.filter((e) => e.name !== entry.name)
  const updated = [...filtered, { ...entry, updated: new Date().toISOString() }]
  await saveLeaderboard(updated)
  return updated.sort((a, b) => b.xp - a.xp)
}

export async function getMyRank(name: string): Promise<number | null> {
  const entries = await getLeaderboard()
  const idx = entries.findIndex((e) => e.name === name)
  return idx >= 0 ? idx + 1 : null
}

export async function getTopEntries(limit = 10): Promise<LeaderboardEntry[]> {
  const entries = await getLeaderboard()
  return entries.slice(0, limit)
}