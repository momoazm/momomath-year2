import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LessonDef } from '../../content/types'
import { hashString } from '../../content/rng'
import { buildSlideDeck, slideMinSeconds } from '../../engine/slideshow'
import { speakAsSonic, stopSpeaking, ttsAvailable } from '../../engine/tts'
import { Mascot } from '../mascots/Mascots'
import { sfx } from '../../engine/sfx'

/** Sonic-taught lesson slideshow that runs BEFORE practice (PLAN 90-94).
 *  - Sonic greets, points at each teach line and works up to 2 examples.
 *  - Every slide speaks in Sonic's voice (tts no-ops when unavailable);
 *    `lang` picks the narrator language (PLAN 124 — e.g. de-DE for german).
 *  - Anti-skip: Next / "Let's go" stay disabled (with a countdown) until the
 *    slide's minimum read time has passed — forward swipe is gated too. */
export function LessonSlideshow({
  lesson,
  title,
  lines,
  objectives,
  onDone,
  lang = 'en-GB',
}: {
  lesson: LessonDef
  title: string
  lines: string[]
  objectives: string[]
  onDone: () => void
  lang?: string
}) {
  const deck = useMemo(
    () => buildSlideDeck(lesson, hashString(lesson.id), title),
    [lesson, title],
  )
  const [idx, setIdx] = useState(0)
  const [, setTick] = useState(0)
  const startRef = useRef<number>(Date.now())
  const touchX = useRef<number | null>(null)

  const slide = deck[Math.min(idx, deck.length - 1)]
  const speakText = slide.kind === 'mission' ? title : slide.text
  const isLast = idx === deck.length - 1

  // restart the anti-skip timer + speak in Sonic's voice on every slide change.
  // Timer reset is a LAYOUT effect: the first render after idx changes still
  // computes `remain` from the previous slide's startRef, so with a passive
  // effect the Next button briefly commits ENABLED before the reset lands —
  // a 1-frame unlock that lets fast taps (and E2E waitForSelector) slip past
  // the gate. Layout effects run before paint, so the locked state is what
  // the browser ever shows.
  useLayoutEffect(() => {
    startRef.current = Date.now()
    setTick(0)
  }, [idx])
  useEffect(() => {
    speakAsSonic(speakText, lang)
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, lang])

  // 250ms ticker keeps the countdown (and the enabled state) live
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 250)
    return () => window.clearInterval(id)
  }, [])

  const minSec = slideMinSeconds(speakText)
  const remain = Math.max(0, Math.ceil(minSec - (Date.now() - startRef.current) / 1000))
  const canNext = remain <= 0

  const next = () => {
    if (!canNext) return
    sfx.tap()
    if (isLast) onDone()
    else setIdx((i) => i + 1)
  }
  const prev = () => {
    if (idx === 0) return
    sfx.tap()
    setIdx((i) => i - 1)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 px-4 py-6"
      data-testid="lesson-slideshow"
      onTouchStart={(e) => { touchX.current = e.changedTouches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        // forward swipe is gated by the same anti-skip timer
        if (dx < -40 && canNext) next()
        else if (dx > 40) prev()
      }}
    >
      <div className="w-full max-w-xl">
        {/* slide progress dots */}
        <div className="mb-3 flex items-center justify-center gap-1.5">
          {deck.map((_, i) => (
            <span
              key={i}
              data-testid="slide-dot"
              className={`h-2.5 rounded-full transition-all ${i === idx ? 'w-6 bg-sky-600' : 'w-2.5 bg-white/80'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            data-testid="slide"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.2 }}
            className="card-white relative overflow-hidden px-5 py-6 text-center"
          >
            {/* Sonic teaches: bobbing mascot + pointing glove */}
            <div className="relative mx-auto h-32 w-40">
              <motion.div
                className="absolute left-2 top-0 h-28 w-28"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Mascot id="sonic" expression={idx % 2 === 0 ? 'thinking' : 'excited'} />
              </motion.div>
              <motion.span
                aria-hidden
                className="absolute left-28 top-10 text-3xl"
                initial={{ x: -30, y: -6, rotate: -24, opacity: 0 }}
                animate={{
                  x: [-30, 14, -30],
                  y: [-6, 10, -6],
                  rotate: [-24, 10, -24],
                  opacity: [0, 1, 1],
                }}
                transition={{ duration: 1.7, repeat: Infinity, repeatDelay: 0.3, delay: 0.2 }}
              >
                👉
              </motion.span>
            </div>

            {slide.kind === 'mission' ? (
              <>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-sky-500">🌟 Today's mission</p>
                <h2 className="font-display text-xl font-extrabold text-slate-800">{title}</h2>
                <div className="mt-2 space-y-1.5">
                  {lines.map((line, i) => (
                    <p key={i} className="rounded-xl bg-sky-50 px-3 py-1.5 text-sm font-bold text-slate-700">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-[11px] font-extrabold text-slate-400">
                  🎯 Cambridge objectives · {objectives.join(' · ')}
                </p>
              </>
            ) : slide.kind === 'example' ? (
              <>
                <p className="text-xs font-extrabold uppercase tracking-widest text-violet-500">✏️ Worked example</p>
                <p className="mt-2 font-body text-lg font-bold leading-relaxed text-slate-700">{slide.prompt}</p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 240, damping: 15 }}
                  className="mt-2 font-display text-2xl font-extrabold text-emerald-500"
                >
                  → {slide.answer}
                </motion.p>
              </>
            ) : (
              <>
                <p className="text-xs font-extrabold uppercase tracking-widest text-sky-500">
                  {slide.kind === 'welcome' ? '👋 Sonic says' : '💡 Learn this'}
                </p>
                <p className="mt-2 font-body text-xl font-bold leading-relaxed text-slate-700">{slide.text}</p>
              </>
            )}

            {/* controls: replay voice + gated navigation */}
            <div className="mt-4 flex items-center justify-center gap-3">
              {ttsAvailable() && (
                <button
                  className="btn3d btn-blue !px-3 !py-1 !text-sm"
                  data-testid="slide-replay"
                  onClick={() => { sfx.tap('audio'); speakAsSonic(speakText, lang) }}
                >
                  🔊
                </button>
              )}
              {idx > 0 && (
                <button className="btn3d btn-grey !px-3 !py-1 !text-sm" data-testid="slide-back" onClick={prev}>
                  ←
                </button>
              )}
              <button
                className={`btn3d ${isLast ? 'btn-green' : 'btn-blue'}`}
                data-testid="slide-next"
                disabled={!canNext}
                style={!canNext ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                onClick={next}
              >
                {canNext
                  ? isLast ? "Let's go! 🚀" : 'Next ➡'
                  : `🔒 Wait ${remain}s`}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
