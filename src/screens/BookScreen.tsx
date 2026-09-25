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
  const touchX = useRef<number | null>(null)

  const lastPage = page === book.pages.length - 1
  const p = book.pages[page]

  // read-along: speak the page whenever it changes (path tap = audio gesture)
  useEffect(() => {
    speakFor('english', book.pages[page].text)
    return () => stopSpeaking()
  }, [book.id, page])

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

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-xl flex-col px-4 pt-3 pb-6">
      <div className="flex items-center justify-between">
        <button className="btn3d btn-blue !px-3 !py-1 !text-sm" onClick={onExit}>
          ✕ Back to path
        </button>
        <span className="rounded-xl bg-white/80 px-2 py-1 text-xs font-extrabold text-slate-600">
          📖 {book.title} · {page + 1}/{book.pages.length}
        </span>
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
              {ttsAvailable() && (
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
                You read the whole book!
              </h2>
              <p className="mt-1 font-body text-sm font-bold text-slate-500">
                {book.title} · {book.pages.length} pages finished
              </p>
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
            <button className="btn3d btn-green !px-4 !py-2" onClick={finish}>
              The End 🎉
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
