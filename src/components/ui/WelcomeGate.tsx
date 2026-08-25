import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GOOGLE_CLIENT_ID, renderGoogleButton, useAuth, type AuthUser } from '../../engine/auth'
import { usePlayer } from '../../engine/store'
import { Mascot } from '../mascots/Mascots'
import { sfx } from '../../engine/sfx'

const NAME_CHIPS = ['Speedster', 'Racer', 'Champion', 'Genius', 'Rocket', 'Star']

export function WelcomeGate() {
  const user = useAuth((s) => s.user)
  const signIn = useAuth((s) => s.signIn)
  const onboarded = usePlayer((s) => s.onboarded)
  const setName = usePlayer((s) => s.setName)
  const setOnboarded = usePlayer((s) => s.setOnboarded)
  const mascot = usePlayer((s) => s.mascot)
  const [draft, setDraft] = useState('')
  const [failed, setFailed] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !btnRef.current || failed || user) return
    let cancelled = false
    renderGoogleButton(btnRef.current, (u: AuthUser) => {
      if (cancelled) return
      signIn(u)
      const p = usePlayer.getState()
      if (p.name === 'Champion' && u.name) p.setName(u.name.split(' ')[0])
      p.setOnboarded()
      sfx.complete()
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [signIn, failed, user])

  if (user || onboarded) return null

  const playAsGuest = () => {
    sfx.tap()
    setName(draft)
    setOnboarded()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gradient-to-b from-[#4aa8ff] via-[#8fd0ff] to-[#d6f1ff] px-4 py-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        className="card-white my-auto w-full max-w-md p-6 text-center"
      >
        <div className="mx-auto h-28 w-28 gpu animate-float-y">
          <Mascot id={mascot} expression="cheer" />
        </div>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-speed-blue">
          Welcome to Momo Year 2 Cambridge!
        </h1>
        <p className="mt-1 font-body text-sm font-bold text-slate-400">
          Sign in to save your name on the leaderboard — or play as a guest.
        </p>

        {GOOGLE_CLIENT_ID && !failed ? (
          <div className="mt-5 flex justify-center" ref={btnRef} />
        ) : (
          <p className="mt-5 font-body text-xs font-bold text-slate-300">
            Google sign-in unavailable — pick a name to play!
          </p>
        )}

        <div className="my-5 flex items-center gap-3">
          <span className="h-0.5 flex-1 rounded bg-slate-100" />
          <span className="font-display text-xs font-bold uppercase tracking-widest text-slate-300">or</span>
          <span className="h-0.5 flex-1 rounded bg-slate-100" />
        </div>

        <input
          value={draft}
          maxLength={16}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && playAsGuest()}
          placeholder="Type your player name"
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-center font-display text-lg font-extrabold outline-none focus:border-speed-blue"
        />
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {NAME_CHIPS.map((n) => (
            <button
              key={n}
              onClick={() => { sfx.tap(); setDraft(n) }}
              className={`rounded-full px-3 py-1 font-display text-xs font-extrabold transition-colors ${
                draft === n ? 'bg-speed-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={playAsGuest}
          className={`btn3d mt-5 w-full ${draft.trim() ? 'btn-green' : 'btn-grey'}`}
        >
          {draft.trim() ? `Play as ${draft.trim()} ▶` : 'Pick a name to play'}
        </button>
        <p className="mt-3 text-[11px] font-bold text-slate-300">
          Progress saves on this device. You can sign in with Google anytime from Profile.
        </p>
      </motion.div>
    </div>
  )
}
