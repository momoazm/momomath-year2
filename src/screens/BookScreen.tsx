import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BookDef } from '../content/types'
import { usePlayer } from '../engine/store'
import { speakFor, stopSpeaking, ttsAvailable } from '../engine/tts'
import { sfx } from '../engine/sfx'

/** Page-by-page storybook reader (PLAN 71): read-along TTS, tap-word speak,
 *  page dots + prev/next + swipe, "The End" finale with a first-read reward. */
export function BookScreen({ book, onExit }: { book: BookDef; onExit: () => void }) {
  const finishBook = usePlayer((s) => s.finishBook)
  const alreadyRead = usePlayer((s) => !!s.booksRead[book.id])
  const [page, setPage] = useState(0)
  const [reward, setReward] = useState(false)
  /** PLAN 97: silent reading is the default — read-along audio is opt-in. */
  const [readAloud, setReadAloud] = useState(false)
  /** PLAN 98: comprehension quiz runs after "The End" (when the book has one). */
  const [phase, setPhase] = useState<'read' | 'quiz'>('read')
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizWrongOnce, setQuizWrongOnce] = useState<Set<number>>(new Set())
  const [shake, setShake] = useState(false)
  const touchX = useRef<number | null>(null)

  const lastPage = page === book.pages.length - 1
  const p = book.pages[page]
  const questions = book.questions ?? []

  // opt-in read-along: speak the page ONLY when the reader turned audio on
  useEffect(() => {
    if (!readAloud) return
    speakFor('english', book.pages[page].text)
    return () => stopSpeaking()
  }, [book.id, page, readAloud])

  const goto = (next: number) => {
    if (next < 0 || next >= book.pages.length) return
    sfx.tap()
    setPage(next)
  }

  const finish = () => {
    const first = !alreadyRead
    finishBook(book.id)
    if (first) {
      try {
        sfx.streak()
      } catch { /* sfx optional */ }
      setReward(true)
    } else {
      onExit()
    }
  }

  // last page → comprehension quiz (when the book has one) → reward
  const endReading = () => {
    if (questions.length > 0) {
      sfx.tap()
      setPhase('quiz')
      return
    }
    finish()
  }
  const quizScore = questions.length - quizWrongOnce.size

  /* ------------------------------ QUIZ (PLAN 98) ---------------------- */
  // NOTE: `!reward` — the final correct answer calls finish(), which sets
  // reward=true; the read-phase return below then renders the reward card.
  if (phase === 'quiz' && !reward) {
    const q = questions[quizIdx]
    const lastQ = quizIdx === questions.length - 1
    return (
      <div className="mx-auto flex h-[100dvh] w-full max-w-xl flex-col px-4 pt-3 pb-6" data-testid="book-quiz">
        <div className="flex items-center justify-between">
          <button
            className="btn3d btn-grey !px-3 !py-1 !text-sm"
            onClick={() => { sfx.tap(); setPhase('read'); setPage(book.pages.length - 1) }}
          >
            ← Back to story
          </button>
          <span className="rounded-xl bg-white/80 px-2 py-1 text-xs font-extrabold text-slate-600">
            📝 Quiz {quizIdx + 1}/{questions.length}
          </span>
        </div>

        <div className="mt-3 flex-1">
          <motion.div
            key={quizIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={shake ? { x: [0, -10, 10, -8, 8, 0], opacity: 1, y: 0 } : { x: 0, opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.35 } : { duration: 0.2 }}
            className="card-white px-5 py-6 text-center"
          >
            <div className="text-4xl">🧠</div>
            <p className="mt-2 font-body text-xl font-bold leading-relaxed text-slate-800">{q.prompt}</p>
            <div className="mt-4 grid gap-3">
              {q.choices.map((c, i) => (
                <button
                  key={i}
                  className="choice-btn justify-center text-center"
                  data-testid="quiz-choice"
                  onClick={() => {
                    if (i === q.answerIndex) {
                      sfx.correct()
                      if (lastQ) finish()
                      else setQuizIdx((n) => n + 1)
                    } else {
                      sfx.wrong()
                      setQuizWrongOnce((s) => new Set(s).add(quizIdx))
                      setShake(true)
                      window.setTimeout(() => setShake(false), 400)
                    }
                  }}
                >
                  <span className="block text-center">{c}</span>
                </button>
              ))}
            </div>
            {quizWrongOnce.has(quizIdx) && q.hint && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-600">💡 {q.hint}</p>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-xl flex-col px-4 pt-3 pb-6">
      <div className="flex items-center justify-between">
        <button className="btn3d btn-blue !px-3 !py-1 !text-sm" onClick={onExit}>
          ✕ Back to path
        </button>
        <span className="rounded-xl bg-white/80 px-2 py-1 text-xs font-extrabold text-slate-600">
          📖 {book.title} · {page + 1}/{book.pages.length}
        </span>
        {ttsAvailable() && (
          <button
            className={`btn3d !px-2 !py-1 !text-xs ${readAloud ? 'btn-blue' : 'btn-grey'}`}
            data-testid="read-aloud-toggle"
            title={readAloud ? 'Read-along is ON — tap to read silently' : 'Reading silently — tap to hear the page'}
            onClick={() => { sfx.tap('audio'); setReadAloud((v) => !v) }}
          >
            {readAloud ? '🔊 Read to me' : '🔇 Read myself'}
          </button>
        )}
      </div>

      <div className="relative mt-3 flex-1">
        <AnimatePresence mode="wait">
          {!reward ? (
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
              className="card-white flex h-full flex-col items-center justify-center px-5 py-6 text-center"
              onTouchStart={(e) => { touchX.current = e.changedTouches[0].clientX }}
              onTouchEnd={(e) => {
                if (touchX.current === null) return
                const dx = e.changedTouches[0].clientX - touchX.current
                touchX.current = null
                if (dx < -40) goto(page + 1)
                else if (dx > 40) goto(page - 1)
              }}
            >
              <div className="flex min-h-28 items-center justify-center gap-2 text-6xl">
                {p.scene.map((e, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.08 * i }}
                    className="inline-block"
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
              <p className="mt-4 font-body text-2xl font-bold leading-relaxed text-slate-800">
                {p.text}
              </p>
              {p.focus && ttsAvailable() && (
                <button
                  className="mt-3 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 px-4 py-1.5 font-display text-lg font-extrabold text-sky-600"
                  title="Tap the word to hear it"
                  onClick={() => { sfx.tap('audio'); speakFor('english', p.focus!) }}
                >
                  👆 {p.focus}
                </button>
              )}
              {readAloud && ttsAvailable() && (
                <button
                  className="btn3d btn-blue mt-4 !px-5 !py-2"
                  onClick={() => { sfx.tap('audio'); speakFor('english', p.text) }}
                >
                  🔊 Read again
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reward"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              className="card-white flex h-full flex-col items-center justify-center px-5 text-center"
            >
              <div className="text-6xl">🎉</div>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-800">
                {questions.length > 0 ? 'You read it and passed the quiz!' : 'You read the whole book!'}
              </h2>
              <p className="mt-1 font-body text-sm font-bold text-slate-500">
                {book.title} · {book.pages.length} pages finished
              </p>
              {questions.length > 0 && (
                <p className="mt-1 font-display text-lg font-extrabold text-emerald-500" data-testid="quiz-score">
                  📝 Quiz {quizScore}/{questions.length}
                </p>
              )}
              <p className="mt-3 font-display text-xl font-extrabold text-amber-500">+20 💎</p>
              <button className="btn3d btn-green mt-5" onClick={onExit}>
                Keep going! 🚀
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!reward && (
        <div className="mt-4 flex items-center justify-between">
          <button
            className="btn3d btn-grey !px-4 !py-2"
            disabled={page === 0}
            style={page === 0 ? { opacity: 0.4 } : undefined}
            onClick={() => goto(page - 1)}
          >
            ←
          </button>
          <div className="flex gap-1.5">
            {book.pages.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${i === page ? 'bg-sky-500' : 'bg-slate-300'}`}
              />
            ))}
          </div>
          {lastPage ? (
            <button className="btn3d btn-green !px-4 !py-2" data-testid="book-end" onClick={endReading}>
              {questions.length > 0 ? 'Quiz time! 📝' : 'The End 🎉'}
            </button>
          ) : (
            <button className="btn3d btn-blue !px-4 !py-2" onClick={() => goto(page + 1)}>
              →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
