import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GOOGLE_CLIENT_ID, renderGoogleButton, useAuth, type AuthUser } from '../../engine/auth'
import { usePlayer } from '../../engine/store'
import { useSyncStatus } from '../../engine/cloudsave'
import { resolveGatePhase } from '../../engine/gatePhase'
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
  { id: 'silver', label: 'Silver' },
  { id: 'cream', label: 'Cream' },
  { id: 'blaze', label: 'Blaze' },
  { id: 'rouge', label: 'Rouge' },
  { id: 'metal', label: 'Metal' },
  { id: 'eggman', label: 'Eggman' },
]

export function WelcomeGate() {
  const user = useAuth((s) => s.user)
  const credential = useAuth((s) => s.credential)
  const signIn = useAuth((s) => s.signIn)
  const onboarded = usePlayer((s) => s.onboarded)
  const setName = usePlayer((s) => s.setName)
  const setMascot = usePlayer((s) => s.setMascot)
  const setOnboarded = usePlayer((s) => s.setOnboarded)
  const syncStatus = useSyncStatus((s) => s.status)
  const remoteSeen = useSyncStatus((s) => s.remoteSeen)
  const qaRaw = Number(new URLSearchParams(window.location.search).get('gate') ?? 0)
  const qaForcedStep: 0 | 2 | 3 = qaRaw === 2 || qaRaw === 3 ? qaRaw : 0

  const phase = resolveGatePhase({
    hasUser: !!user,
    hasCredential: !!credential,
    syncStatus,
    remoteExists: remoteSeen,
    localOnboarded: onboarded,
    qaForcedStep,
  })

  const [step, setStep] = useState<2 | 3>(qaForcedStep || 2)
  const [draft, setDraft] = useState('')
  const [picked, setPicked] = useState<MascotId>('sonic')
  const [failed, setFailed] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)

  /* New user just became picker-eligible: prefill Google first name. */
  useEffect(() => {
    if (phase === 'picker' && user) {
      setDraft((d) => d || user.name.split(' ')[0])
    }
  }, [phase, user])

  /* If the Google button never paints (GIS blocked/slow/hung iframe),
     renderButton may never reject — surface the error + Retry on a
     timeout instead of stranding the user on a dead sign-in card. */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || failed || user) return
    const t = setTimeout(() => {
      if (!btnRef.current?.querySelector('iframe')) setFailed(true)
    }, 6000)
    return () => clearTimeout(t)
  }, [failed, user])

  const retrySignIn = () => {
    sfx.tap()
    setFailed(false)
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !btnRef.current || failed || user) return
    let cancelled = false
    renderGoogleButton(btnRef.current, (u: AuthUser, credential: string) => {
      if (cancelled) return
      signIn(u, credential)
      sfx.complete()
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [signIn, failed, user])

  /* Closes only when resolveGatePhase says the session is settled and
     onboarded — never on user presence alone (that skipped the picker
     and the remote-save wait). `?gate=2|3` forces the picker for QA. */
  if (phase === 'open' && !qaRaw) return null

  const finish = () => {
    sfx.complete()
    const finalName = draft.trim() || 'Player'
    setName(finalName)
    setMascot(picked)
    setOnboarded()
  }

  const activeDot = phase === 'signin' ? 1 : phase === 'picker' ? step : 0
  const stepDots = (
    <div className="mb-4 flex justify-center gap-2">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-2.5 w-8 rounded-full ${n === activeDot ? 'bg-speed-blue' : n < activeDot ? 'bg-emerald-400' : 'bg-slate-200'}`}
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
        {phase === 'signin' && (
          <>
            {stepDots}
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
                  Google sign-in unavailable right now. Check your connection and try again.
                </p>
                <button onClick={retrySignIn} className="btn3d btn-grey mt-4 w-full">
                  Retry
                </button>
              </>
            )}
          </>
        )}

        {phase === 'loading' && (
          <>
            <div className="mx-auto h-24 w-24 gpu animate-float-y">
              <Mascot id="sonic" expression="happy" />
            </div>
            <h2 className="mt-2 font-display text-xl font-extrabold text-speed-blue">
              Loading your progress…
            </h2>
            <p className="mt-1 font-body text-sm font-bold text-slate-400">
              Syncing your save from the cloud.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-3 w-3 rounded-full bg-speed-blue"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </>
        )}

        {phase === 'picker' && (
          <>
            {stepDots}

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
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {CHARACTERS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { sfx.tap(c.id); setPicked(c.id) }}
                      className={`flex flex-col items-center rounded-2xl border-2 p-2 transition-transform hover:scale-105 ${
                        picked === c.id ? 'border-speed-blue bg-speed-bluelight shadow-pop' : 'border-slate-100'
                      }`}
                    >
                      <div className="h-14 w-14">
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
          </>
        )}
      </motion.div>
    </div>
  )
}
