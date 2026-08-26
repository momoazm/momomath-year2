// Tiny dependency-free reactive store (zustand-style API) for MomoMath Year 2.
// Persisted to localStorage so progress survives reloads.

export interface PlayerState {
  name: string
  mascot: string
  gems: number
  xp: number
  league: string
  streak: number
  streakDates: string[]
  streakFreezes: number
  shopInventory: Record<string, number>
  activeEffects: {
    doubleXpLessons: number
    chestBoosts: number
  }
  wallpapers: string[]
  equippedWallpaper: string | null
  chestStats: {
    opened: number
    sinceLegendary: number
    sinceRarePlus: Record<string, number>
  }
}

const STORAGE_KEY = 'momomath-year2-player'

const initialState: PlayerState = {
  name: 'Momo',
  mascot: '🐱',
  gems: 0,
  xp: 0,
  league: 'Wood',
  streak: 0,
  streakDates: [],
  streakFreezes: 0,
  shopInventory: {},
  activeEffects: { doubleXpLessons: 0, chestBoosts: 0 },
  wallpapers: [],
  equippedWallpaper: null,
  chestStats: { opened: 0, sinceLegendary: 0, sinceRarePlus: {} },
}

type Listener = (state: PlayerState, prev: PlayerState) => void

function loadInitial(): PlayerState {
  const base: PlayerState = structuredClone(initialState)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<PlayerState>
      return { ...base, ...saved }
    }
  } catch {
    // corrupted storage -> fresh start
  }
  return base
}

function createUsePlayer() {
  let state: PlayerState = loadInitial()
  const listeners = new Set<Listener>()

  return {
    getState: (): PlayerState => state,
    setState(partial: Partial<PlayerState> | ((s: PlayerState) => Partial<PlayerState>)): void {
      const prev = state
      const patch = typeof partial === 'function' ? partial(prev) : partial
      state = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // storage full/unavailable - keep in-memory state
      }
      listeners.forEach((l) => l(state, prev))
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const usePlayer = createUsePlayer()

export function addGems(amount: number): void {
  usePlayer.setState((s) => ({ gems: Math.max(0, s.gems + amount) }))
}

export function addXp(amount: number): void {
  usePlayer.setState((s) => ({ xp: Math.max(0, s.xp + amount) }))
}

export function setMascot(mascot: string): void {
  usePlayer.setState({ mascot })
}

export function spendGems(amount: number): boolean {
  const s = usePlayer.getState()
  if (s.gems < amount) return false
  usePlayer.setState({ gems: s.gems - amount })
  return true
}
