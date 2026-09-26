import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { isValidAnchor, usePlayer } from '../engine/store'
import { useAuth } from '../engine/auth'
import { sfx } from '../engine/sfx'
import { speak, stopSpeaking } from '../engine/tts'
import { fetchSharedPlayers, pushSharedPlayer, weeklyXpOf, type SharedPlayer } from '../engine/leaderboard'
import { leagueWeekElapsed, weekKey } from '../engine/gamification'
import {
  fetchFriends,
  fetchMyCode,
  joinFriend,
  regenerateMyCode,
  FriendsError,
  type FriendRow,
} from '../engine/friends'
import { Mascot } from '../components/mascots/Mascots'

const CODE_CACHE_KEY = 'momomath-year2-friendcode'

interface Row {
  id: string
  name: string
  xp: number
  isMe: boolean
  mascot?: string
}

const MEDALS = ['👑', '🥈', '🥉']

export function FriendsScreen({ onClose }: { onClose: () => void }) {
  const s = usePlayer()
  const user = useAuth((a) => a.user)

  // Same id scheme the leaderboard uses (g:<sub> signed-in, name:<n> guest) so
  // friend ids match leaderboard entries 1:1 for the weekly-XP join.
  const playerId = user?.sub ? `g:${user.sub}` : `name:${(s.name.trim() || 'Champion').toLowerCase()}`

  const [code, setCode] = useState('')
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [shared, setShared] = useState<SharedPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [joinInput, setJoinInput] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [reward, setReward] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3400)
  }, [])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  // Share my weekly XP on the board from here too — a friend shouldn't see 0
  // for me just because I never opened the Leagues tab. Same guard as
  // LeaguesScreen: never push a stale/elapsed league week.
  const boardWeek = weekKey(new Date())
  const weekLive = isValidAnchor(s.weeklyXpWeek) && !leagueWeekElapsed(s.weeklyXpWeek)
  useEffect(() => {
    if (!s.name.trim() || !weekLive) return
    void pushSharedPlayer({
      id: playerId,
      name: s.name.trim(),
      xp: s.weeklyXp,
      league: s.currentLeague,
      mascot: s.mascot,
      week: boardWeek,
    }).then((entries) => { if (entries.length) setShared(entries) }).catch(() => {})
  }, [playerId, s.name, s.weeklyXp, s.currentLeague, s.mascot, weekLive, boardWeek])

  const load = useCallback(async () => {
    setLoading(true)
    // Cached code shows instantly and covers the 1s server write cooldown
    // when the screen is reopened quickly; the POST refreshes it.
    try {
      const cached = window.localStorage.getItem(`${CODE_CACHE_KEY}:${playerId}`)
      if (cached) setCode(cached)
    } catch { /* private mode */ }
    const [codeResult, friendResult, board] = await Promise.allSettled([
      fetchMyCode(playerId, s.name.trim() || 'Champion'),
      fetchFriends(playerId),
      fetchSharedPlayers(),
    ])
    if (codeResult.status === 'fulfilled' && codeResult.value) {
      setCode(codeResult.value)
      try {
        window.localStorage.setItem(`${CODE_CACHE_KEY}:${playerId}`, codeResult.value)
      } catch { /* private mode */ }
    } else if (codeResult.status === 'rejected') {
      const err = codeResult.reason
      // Only nag when we have nothing to show — a cooldown right after a
      // successful mint is invisible thanks to the cache above.
      if (err instanceof FriendsError && !cachedCode(playerId)) showToast(err.message)
    }
    if (friendResult.status === 'fulfilled') setFriends(friendResult.value)
    else if (friendResult.reason instanceof FriendsError) showToast(friendResult.reason.message)
    if (board.status === 'fulfilled') setShared(board.value)
    setLoading(false)
  }, [playerId, s.name, showToast])

  useEffect(() => { void load() }, [load])

  const boardWeekNow = weekKey(new Date())
  const myXp = s.weeklyXpWeek === boardWeekNow ? s.weeklyXp : 0

  const rows: Row[] = [
    ...friends.map((f) => {
      const entry = shared.find(
        (p) => p.id === f.id || p.name.trim().toLowerCase() === f.name.trim().toLowerCase(),
      )
      return {
        id: f.id,
        name: f.name,
        xp: entry ? weeklyXpOf(entry, boardWeekNow) : 0,
        isMe: false,
        mascot: entry?.mascot,
      }
    }),
    { id: 'me', name: s.name.trim() || 'You', xp: myXp, isMe: true, mascot: s.mascot },
  ].sort((a, b) => b.xp - a.xp || Number(a.isMe) - Number(b.isMe) || a.name.localeCompare(b.name))

  async function onCopy() {
    if (!code) return
    sfx.tap()
    try {
      await navigator.clipboard.writeText(code)
      showToast('Copied! Send it to a friend 📋')
    } catch {
      showToast('Press and hold the code to copy it ✋')
    }
  }

  function onReadAloud() {
    if (!code) return
    sfx.tap()
    // Spell it letter-by-letter — kids share codes by voice message.
    speak(`My friend code is ${code.split('').join(' ')}`, 0.85, 'en-GB')
  }

  async function onRegenerate() {
    if (busy) return
    setBusy(true)
    try {
      const next = await regenerateMyCode(playerId, s.name.trim() || 'Champion')
      setCode(next)
      try {
        window.localStorage.setItem(`${CODE_CACHE_KEY}:${playerId}`, next)
      } catch { /* private mode */ }
      sfx.tap()
      showToast('New code! The old one stopped working — share this one 🔄')
    } catch (e) {
      showToast(e instanceof FriendsError ? e.message : 'Could not make a new code yet.')
    } finally {
      setBusy(false)
    }
  }

  async function onJoin() {
    const raw = joinInput.trim()
    if (!raw || busy) return
    setBusy(true)
    try {
      const result = await joinFriend(playerId, s.name.trim() || 'Champion', raw)
      setJoinInput('')
      if (result.already) {
        sfx.tap()
        showToast(`You and ${result.friendName} are already friends! 🤝`)
      } else if (result.firstJoin) {
        // PLAN 83: one-time +30 gems + made-a-friend achievement
        sfx.leagueUp()
        s.recordFriendJoin()
        setReward(result.friendName)
      } else {
        sfx.whoosh()
        showToast(`You and ${result.friendName} are friends now! 🎉`)
      }
      try {
        const refreshed = await fetchFriends(playerId)
        setFriends(refreshed)
      } catch { /* keep the old list */ }
    } catch (e) {
      sfx.tap()
      showToast(e instanceof FriendsError ? e.message : 'That did not work — try again 💪')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => { stopSpeaking(); sfx.tap(); onClose() }} className="btn3d btn-grey !px-3 !py-2" aria-label="Back">←</button>
        <h1 className="font-display text-2xl font-extrabold text-slate-800">Friends 🤝</h1>
      </div>

      {/* invite code (PLAN 107 — now labelled as the referral code) */}
      <section className="card-white bg-gradient-to-br from-sky-50 to-indigo-50 text-center" data-testid="referral-card">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Your referral code</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="font-display text-4xl font-extrabold tracking-[0.25em] text-slate-800" data-testid="referral-code">
            {loading && !code ? '······' : code || '······'}
          </span>
          <button onClick={onReadAloud} title="Read my code aloud" aria-label="Read my code aloud"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-pop transition-transform hover:scale-110">🔊</button>
        </div>
        <p className="mt-2 text-xs font-extrabold text-emerald-600" data-testid="referral-reward">
          🎁 Give this code to a friend — when they add it, they get +30 💎!
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={onCopy} className="btn3d btn-green !px-4 !py-2 !text-sm" disabled={!code}>📋 Copy</button>
          <button onClick={onRegenerate} disabled={busy || !code} className="btn3d btn-grey !px-4 !py-2 !text-sm">
            🔄 New code
          </button>
        </div>
        <p className="mt-3 text-xs font-bold text-slate-400">
          Send your code to a friend, then add theirs below!
        </p>
      </section>

      {/* join by code */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Add a friend</p>
        <div className="mt-2 flex gap-2">
          <input
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value.toUpperCase().slice(0, 12))}
            onKeyDown={(e) => { if (e.key === 'Enter') void onJoin() }}
            placeholder="THEIR CODE"
            aria-label="Friend code"
            className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-center font-display text-lg font-extrabold tracking-[0.2em] uppercase outline-none focus:border-speed-blue"
          />
          <button onClick={() => void onJoin()} disabled={busy || !joinInput.trim()}
            className="btn3d btn-green !px-4 !py-2 !text-sm disabled:opacity-50">
            {busy ? '…' : 'Add'}
          </button>
        </div>
      </section>

      {/* friends + me, ranked by this week's XP */}
      <section className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-700">This week's battle ⚡</h2>
          <span className="text-xs font-bold text-slate-700">monday → sunday</span>
        </div>

        {friends.length === 0 && !loading ? (
          <div className="card-white flex flex-col items-center py-8 text-center">
            <div className="h-24 w-24 animate-bob"><Mascot id="cream" expression="happy" /></div>
            <p className="mt-2 font-display text-lg font-extrabold text-slate-700">No friends yet</p>
            <p className="mt-1 max-w-xs text-sm font-bold text-slate-400">
              Send your code to a friend! When they add it, you'll both show up here 🎁
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li key={r.id}
                className={`card-white flex items-center gap-3 !py-3 ${r.isMe ? 'ring-2 ring-speed-blue bg-sky-50' : ''}`}>
                <span className="w-8 text-center font-display text-lg font-extrabold text-slate-400">
                  {MEDALS[i] ?? `#${i + 1}`}
                </span>
                <div className="h-8 w-8 shrink-0">
                  <Mascot id={(r.mascot || s.mascot) as never} expression={r.isMe ? 'excited' : 'happy'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-bold">
                    {r.name}{r.isMe && <span className="ml-1 text-xs text-speed-blue">· you</span>}
                  </p>
                </div>
                <span className="font-display text-sm font-extrabold text-amber-500">{r.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-center text-xs font-bold text-slate-700">
        🔒 Friends see only your display name and weekly XP — nothing else ever leaves your device.
      </p>

      {/* toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-xl bg-slate-800/90 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            {toast}
          </div>
        </motion.div>
      )}

      {/* first-friend celebration (PLAN 83) */}
      {reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-6">
          <motion.div initial={{ scale: 0.7, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="card-white w-full max-w-xs text-center">
            <div className="mx-auto h-24 w-24"><Mascot id={s.mascot} expression="cheer" /></div>
            <div className="text-4xl">🤝</div>
            <h2 className="mt-1 font-display text-xl font-extrabold text-slate-800">You made a friend!</h2>
            <p className="mt-0.5 text-xs font-bold text-slate-500">
              You and {reward} can now see each other's weekly XP
            </p>
            <p className="mt-2 font-display text-lg font-extrabold text-amber-500">+30 💎</p>
            <p className="text-xs font-bold text-slate-400">+ Best Friends 🤝 achievement</p>
            <button className="btn3d btn-green mt-4" onClick={() => { sfx.tap(); setReward(null) }}>
              Yay! 🎉
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function cachedCode(playerId: string): string | null {
  try {
    return window.localStorage.getItem(`${CODE_CACHE_KEY}:${playerId}`)
  } catch {
    return null
  }
}
