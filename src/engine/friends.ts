// Friend network client for momomath-year2 (PLAN Phase 17, steps 82-84).
//
// Privacy model (step 84): the friends service stores ONLY a display name and
// a one-way referral code — never email, never progress. Weekly XP is NOT
// fetched from here; the screen joins it in from the existing leaderboard GET,
// so what a friend can see is exactly "display name + weekly XP".

export const FRIENDS_API = 'https://momolearn-ai.vercel.app/api/year2/friends'

export interface FriendRow {
  id: string
  name: string
}

export interface JoinResult {
  friendName: string
  friendId: string
  firstJoin: boolean
  already: boolean
}

export class FriendsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FriendsError'
  }
}

const OFFLINE = "No internet right now — try again in a bit 🛜"

async function request(path: string, init?: RequestInit): Promise<any> {
  let res: Response
  try {
    res = await fetch(FRIENDS_API + path, {
      ...init,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch {
    throw new FriendsError(OFFLINE)
  }
  let data: any = null
  try {
    data = await res.json()
  } catch {
    throw new FriendsError(OFFLINE)
  }
  if (!res.ok || data?.ok === false) {
    // The server already returns kid-friendly copy ("That code doesn't
    // match — check the letters!") — surface it verbatim when present.
    throw new FriendsError(String(data?.error || OFFLINE))
  }
  return data
}

/** Fetch (or create) my stable 6-char referral code. */
export async function fetchMyCode(playerId: string, name: string): Promise<string> {
  const data = await request('/code', {
    method: 'POST',
    body: JSON.stringify({ playerId, name }),
  })
  return String(data?.code ?? '')
}

/**
 * Mint a NEW code. The old code stops working for NEW joins (server-side
 * revoke); existing friendships are never removed (no-deletion rule).
 */
export async function regenerateMyCode(playerId: string, name: string): Promise<string> {
  const data = await request('/code', {
    method: 'POST',
    body: JSON.stringify({ playerId, name, regenerate: true }),
  })
  return String(data?.code ?? '')
}

/** Join a friend from their referral code. Throws FriendsError with friendly copy. */
export async function joinFriend(playerId: string, name: string, code: string): Promise<JoinResult> {
  const data = await request('/join', {
    method: 'POST',
    body: JSON.stringify({ playerId, name, code }),
  })
  return {
    friendName: String(data?.friendName ?? 'your friend'),
    friendId: String(data?.friendId ?? ''),
    firstJoin: data?.firstJoin === true,
    already: data?.already === true,
  }
}

/** My friends as id + display name (weekly XP comes from the leaderboard). */
export async function fetchFriends(playerId: string): Promise<FriendRow[]> {
  const data = await request(`/list?playerId=${encodeURIComponent(playerId)}`)
  if (!Array.isArray(data?.friends)) return []
  return data.friends
    .filter((f: any) => f && typeof f.id === 'string')
    .map((f: any) => ({ id: String(f.id), name: String(f.name || 'Champion').slice(0, 24) }))
}
