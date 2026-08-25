import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GOOGLE_CLIENT_ID, renderGoogleButton, useAuth, type AuthUser } from '../../engine/auth'
import { usePlayer } from '../../engine/store'
import { MASCOTS, Mascot } from '../mascots/Mascots'
import { sfx } from '../../engine/sfx'
import type { MascotId } from '../../content/types'

const NAME_CHIPS = ['Speedster', 'Racer', 'Champion', 'Genius', 'Rocket', 'Star']
const CHARACTERS: { id: MascotId; label: string }[] = [
  { id: 'sonic', label: 'Sonic' },
  { id: 'tails', label: 'Tails' },
  { id: 'knuckles', label: 'Knuckles' },
  { id: 'amy', label: 'Amy' },
  { id: 'shadow', label: 'Shadow' },
]

export function WelcomeGate() {
  const user = useAuth((s) => s.user)
  const signIn = useAuth((s) => s.signIn)
  const onboarded = usePlayer((s) => s.onboarded)
  const setName = usePlayer((s) => s.setName)
  const setMascot = usePlayer((s) => s.setMascot)
  const setOnboarded = usePlayer((s) => s.setOnboarded)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [draft, setDraft] = useState('')
  const [picked, setPicked] = useState<MascotId>('sonic')
  const [failed, setFailed] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && step === 1) {
      setDraft(user.name.split(' ')[0])
      setStep(2)
    }
  }, [user, step])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !btnRef.current || failed || user) return
    let cancelled = false
    renderGoogleButton(btnRef.current, (u: AuthUser) => {
      if (cancelled) return
      signIn(u)
      sfx.complete()
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [signIn, failed, user])

  if (onboarded) return null
  if (user && step === 1) return null

  const finish = () => {
    sfx.complete()
    setName(draft)
    setMascot(picked)
    setOnboarded()
  }

  const stepDots = (
    <div className="mb-4 flex justify-center gap-2">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-2.5 w-8 rounded-full ${n === step ? 'bg-speed-blue' : n < step ? 'bg-emerald-400' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gradient-to-b from-[#4aa8ff] via-[#8fd0ff] to-[#d6f1ff] px-4 py-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        className="card-white my-auto w-full max-w-md p-6 text-center"
      >
        {stepDots}

        {step === 1 && (
          <>
            <div className="mx-auto h-28 w-28 gpu animate-float-y">
              <Mascot id="sonic" expression="cheer" />
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-speed-blue">
              Welcome to Momo Year 2 Cambridge!
            </h1>
            <p className="mt-1 font-body text-sm font-bold text-slate-400">
              Step 1 - Sign in with your Google account to join the leaderboard.
            </p>
            {GOOGLE_CLIENT_ID && !failed ? (
              <div className="mt-6 flex justify-center" ref={btnRef} />
            ) : (
              <>
                <p className="mt-6 font-body text-xs font-bold text-slate-300">
                  Google sign-in unavailable right now.
                </p>
                <button
                  onClick={() => { sfx.tap(); setDraft('Player'); setStep(2) }}
                  className="btn3d btn-grey mt-4 w-full"
                >
                  Continue without signing in
                </button>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="mx-auto h-24 w-24 gpu animate-float-y">
              <Mascot id="tails" expression="excited" />
            </div>
            <h2 className="mt-2 font-display text-xl font-extrabold text-speed-blue">
              Step 2 - Pick your player name
            </h2>
            <p className="mt-1 font-body text-sm font-bold text-slate-400">
              This is the name everyone sees on the leaderboard.
            </p>
            <input
              value={draft}
              maxLength={16}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && draft.trim() && (sfx.tap(), setStep(3))}
              placeholder="Type your name"
              className="mt-4 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-center font-display text-lg font-extrabold outline-none focus:border-speed-blue"
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
              onClick={() => { sfx.tap(); setStep(3) }}
              disabled={!draft.trim()}
              className={`btn3d mt-5 w-full ${draft.trim() ? 'btn-blue' : 'btn-grey'}`}
            >
              Next: choose character
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="mt-2 font-display text-xl font-extrabold text-speed-blue">
              Step 3 - Choose your character
            </h2>
            <p className="mt-1 font-body text-sm font-bold text-slate-400">
              Tap a character to play as {draft || 'them'}!
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { sfx.tap(c.id); setPicked(c.id) }}
                  className={`flex flex-col items-center rounded-2xl border-2 p-2 transition-transform hover:scale-105 ${
                    picked === c.id ? 'border-speed-blue bg-speed-bluelight' : 'border-slate-100'
                  }`}
                >
                  <div className="h-12 w-12">
                    <Mascot id={c.id} expression={picked === c.id ? 'excited' : 'happy'} />
                  </div>
                  <span className={`mt-1 font-display text-[10px] font-extrabold ${picked === c.id ? 'text-speed-blue' : 'text-slate-400'}`}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
            <button onClick={finish} className="btn3d btn-green mt-6 w-full">
              Start playing as {draft} ▶
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
