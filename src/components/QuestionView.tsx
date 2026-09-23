import { useMemo, useState } from 'react'
import type { Question, VisualSpec } from '../content/types'
import { correctAnswerText } from '../engine/questionText'
import { gradeSpeak } from '../engine/speakGrade'
import { speak } from '../engine/tts'

export interface GradeResult {
  correct: boolean
  studentAnswer: string
  correctAnswer: string
}

interface Props {
  q: Question
  disabled?: boolean
  onSubmit: (g: GradeResult) => void
}

function Visual({ v }: { v?: VisualSpec }) {
  if (!v) return null
  if (v.type === 'emoji-group')
    return <p className="my-2 text-3xl tracking-widest">{v.emojis.join(' ')}</p>
  if (v.type === 'ten-frames')
    return (
      <div className="my-2 grid grid-cols-5 gap-1" style={{ width: 120 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`h-5 w-5 rounded border ${i < v.count ? 'bg-speed-blue' : 'bg-white'}`} />
        ))}
      </div>
    )
  if (v.type === 'number-line')
    return (
      <div className="my-2 rounded-xl bg-white p-2 text-center font-display font-extrabold text-slate-600">
        {v.from} ————— ● {v.mark} ————— {v.to}
      </div>
    )
  if (v.type === 'shapes')
    return <p className="my-2 text-3xl">{`${v.shape} `.repeat(v.count).trim()}</p>
  if (v.type === 'fraction') {
    const pct = v.slices > 0 ? (v.filled / v.slices) * 100 : 0
    return (
      <div className="my-2 mx-auto h-16 w-16 rounded-full border-4 border-slate-700" style={{ background: `conic-gradient(#4a90e2 ${pct}%, #fff ${pct}%)` }} />
    )
  }
  const angle = (v.minute / 60) * 360
  const hourAngle = ((v.hour % 12) + v.minute / 60) * 30
  return (
    <div className="my-2 relative mx-auto h-16 w-16 rounded-full border-4 border-slate-700 bg-white">
      <div className="absolute left-1/2 top-1/2 h-0.5 w-5 origin-left bg-slate-700" style={{ transform: `rotate(${angle}deg)` }} />
      <div className="absolute left-1/2 top-1/2 h-0.5 w-3 origin-left bg-slate-700" style={{ transform: `rotate(${hourAngle}deg)` }} />
    </div>
  )
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let h = seed >>> 0
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0
    const j = h % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function QuestionView({ q, disabled, onSubmit }: Props) {
  const correctAnswer = correctAnswerText(q)
  const [typed, setTyped] = useState('')
  const [tapSel, setTapSel] = useState<number[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [spell, setSpell] = useState<string[]>([])
  const [matchLeft, setMatchLeft] = useState<number | null>(null)
  const [matchMap, setMatchMap] = useState<Record<number, number>>({})
  const [speaking, setSpeaking] = useState(false)

  const mcqChoices = q.kind === 'mcq' ? q.choices : []
  const orderShuffled = useMemo(
    () => (q.kind === 'order' ? shuffle(q.items, q.prompt.length * 31 + 7) : []),
    [q],
  )
  const tileLetters = useMemo(() => {
    if (q.kind !== 'letter-tiles') return []
    return shuffle(q.targetWord.toUpperCase().split(''), q.targetWord.length * 17 + 3)
  }, [q])
  const rightShuffled = useMemo(
    () => (q.kind === 'match' ? shuffle(q.pairs.map((_, i) => i), 99) : []),
    [q],
  )

  const submit = (g: GradeResult) => {
    if (disabled) return
    onSubmit(g)
  }

  if (q.kind === 'mcq')
    return (
      <div>
        <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
        <Visual v={q.visual} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {mcqChoices.map((c, i) => (
            <button
              key={i}
              disabled={disabled}
              onClick={() => submit({ correct: i === q.answerIndex, studentAnswer: c, correctAnswer })}
              className="rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 font-display font-extrabold text-slate-700 hover:border-speed-blue disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    )

  if (q.kind === 'truefalse')
    return (
      <div>
        <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
        <p className="mt-1 rounded-xl bg-white p-3 font-bold text-slate-600">{q.statement}</p>
        <Visual v={q.visual} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              disabled={disabled}
              onClick={() => submit({ correct: v === q.answer, studentAnswer: v ? 'True' : 'False', correctAnswer })}
              className="rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 font-display text-xl font-extrabold text-slate-700 hover:border-speed-blue"
            >
              {v ? '✅ True' : '❌ False'}
            </button>
          ))}
        </div>
      </div>
    )

  if (q.kind === 'type-number')
    return (
      <div>
        <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
        <Visual v={q.visual} />
        <input
          id="numans"
          inputMode="numeric"
          value={typed}
          disabled={disabled}
          onChange={(e) => setTyped(e.target.value.replace(/[^0-9-]/g, ''))}
          className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-center font-display text-2xl font-extrabold outline-none focus:border-speed-blue"
          placeholder="?"
        />
        <button
          disabled={disabled || typed === ''}
          onClick={() => submit({ correct: Number(typed) === q.answer, studentAnswer: typed, correctAnswer })}
          className="btn3d btn-green mt-3 w-full"
        >
          Attack!
        </button>
      </div>
    )

  if (q.kind === 'tap-count') {
    const targets = q.cells.map((c, i) => (c === q.targetEmoji ? i : -1)).filter((i) => i >= 0)
    return (
      <div>
        <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {q.cells.map((c, i) => (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setTapSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))}
              className={`rounded-xl border-2 py-3 text-2xl ${
                tapSel.includes(i) ? 'border-speed-blue bg-speed-bluelight' : 'border-slate-200 bg-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          disabled={disabled || tapSel.length === 0}
          onClick={() => {
            const sel = [...tapSel].sort((a, b) => a - b)
            const tgt = [...targets].sort((a, b) => a - b)
            const correct = sel.length === tgt.length && sel.every((v, i) => v === tgt[i])
            submit({ correct, studentAnswer: `${tapSel.length} tapped`, correctAnswer: `${targets.length} ${q.targetEmoji}` })
          }}
          className="btn3d btn-green mt-3 w-full"
        >
          Attack!
        </button>
      </div>
    )
  }

  if (q.kind === 'match') {
    const allDone = Object.keys(matchMap).length === q.pairs.length
    return (
      <div>
        <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {q.pairs.map((p, i) => (
              <button
                key={i}
                disabled={disabled || matchMap[i] !== undefined}
                onClick={() => setMatchLeft(i)}
                className={`w-full rounded-xl border-2 px-2 py-2 text-sm font-extrabold ${
                  matchMap[i] !== undefined
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : matchLeft === i
                      ? 'border-speed-blue bg-speed-bluelight'
                      : 'border-slate-200 bg-white'
                }`}
              >
                {p.left} {matchLeft === i ? '👆' : ''}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightShuffled.map((pi) => (
              <button
                key={pi}
                disabled={disabled || Object.values(matchMap).includes(pi)}
                onClick={() => {
                  if (matchLeft === null) return
                  setMatchMap((m) => ({ ...m, [matchLeft]: pi }))
                  setMatchLeft(null)
                }}
                className={`w-full rounded-xl border-2 px-2 py-2 text-sm font-extrabold ${
                  Object.values(matchMap).includes(pi) ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white'
                }`}
              >
                {q.pairs[pi].right}
              </button>
            ))}
          </div>
        </div>
        <button
          disabled={disabled || !allDone}
          onClick={() => {
            const byLeft = q.pairs.map((p, i) => ({ left: p.left, right: q.pairs[matchMap[i]]?.right }))
            const ok = byLeft.every((row, i) => row.right === q.pairs[i].right)
            submit({
              correct: ok,
              studentAnswer: byLeft.map((r) => `${r.left}→${r.right}`).join(', '),
              correctAnswer: q.pairs.map((p) => `${p.left}→${p.right}`).join(', '),
            })
          }}
          className="btn3d btn-green mt-3 w-full"
        >
          Attack!
        </button>
      </div>
    )
  }

  if (q.kind === 'order') {
    const full = order.length === q.items.length
    return (
      <div>
        <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {order.map((it, i) => (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setOrder((o) => o.filter((_, k) => k !== i))}
              className="rounded-xl border-2 border-speed-blue bg-speed-bluelight px-3 py-2 font-extrabold text-speed-blue"
            >
              {i + 1}. {it}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {orderShuffled
            .filter((it) => !order.includes(it))
            .map((it) => (
              <button
                key={it}
                disabled={disabled}
                onClick={() => setOrder((o) => [...o, it])}
                className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-extrabold text-slate-700"
              >
                {it}
              </button>
            ))}
        </div>
        <button
          disabled={disabled || !full}
          onClick={() => submit({ correct: order.join('|') === q.items.join('|'), studentAnswer: order.join(' → '), correctAnswer: q.items.join(' → ') })}
          className="btn3d btn-green mt-3 w-full"
        >
          Attack!
        </button>
      </div>
    )
  }

  if (q.kind === 'letter-tiles') {
    const full = spell.length === q.targetWord.length
    return (
      <div>
        <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
        <div className="mt-2 flex min-h-[3rem] flex-wrap gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white p-2">
          {spell.map((ch, i) => (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setSpell((s) => s.filter((_, k) => k !== i))}
              className="h-9 w-9 rounded-lg bg-speed-blue font-display text-lg font-extrabold text-white"
            >
              {ch}
            </button>
          ))}
          {spell.length === 0 && <span className="p-2 text-sm font-bold text-slate-400">Tap letters…</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {tileLetters.map((ch, i) => (
            <button
              key={i}
              disabled={disabled || spell.length >= q.targetWord.length}
              onClick={() => setSpell((s) => [...s, ch])}
              className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white font-display text-lg font-extrabold text-slate-700"
            >
              {ch}
            </button>
          ))}
        </div>
        <button
          disabled={disabled || !full}
          onClick={() => {
            const ans = spell.join('')
            submit({ correct: ans.toUpperCase() === q.targetWord.toUpperCase(), studentAnswer: ans, correctAnswer: q.targetWord })
          }}
          className="btn3d btn-green mt-3 w-full"
        >
          Attack!
        </button>
      </div>
    )
  }

  // speak
  const recog =
    typeof window !== 'undefined'
      ? ((window as unknown as Record<string, unknown>).SpeechRecognition ||
         (window as unknown as Record<string, unknown>).webkitSpeechRecognition)
      : undefined
  const hasRecog = Boolean(recog)
  return (
    <div>
      <p className="font-display text-lg font-extrabold text-slate-800">{q.prompt}</p>
      <p className="mt-1 rounded-xl bg-white p-3 text-center font-display text-xl font-extrabold text-speed-blue">
        {q.targetText}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button className="btn3d btn-blue !py-2 !text-base" onClick={() => speak(q.targetText)}>
          🔊 Hear it
        </button>
        {hasRecog && (
          <button
            className="btn3d btn-green !py-2 !text-base"
            disabled={disabled || speaking}
            onClick={() => {
              const R = recog as new () => {
                lang: string
                onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void
                onerror: () => void
                onend: () => void
                start: () => void
              }
              const r = new R()
              setSpeaking(true)
              r.lang = 'en-GB'
              r.onresult = (e) => {
                const said = e.results[0][0].transcript
                const g = gradeSpeak(said, q.targetText)
                setSpeaking(false)
                submit({ correct: g.ok, studentAnswer: said, correctAnswer: q.targetText })
              }
              r.onerror = () => {
                setSpeaking(false)
                submit({ correct: true, studentAnswer: '(speech unavailable — self check)', correctAnswer: q.targetText })
              }
              r.onend = () => setSpeaking(false)
              r.start()
            }}
          >
            🎤 Say it
          </button>
        )}
        <button
          className="btn3d !bg-slate-200 !py-2 !text-base text-slate-700"
          disabled={disabled}
          onClick={() => submit({ correct: true, studentAnswer: q.targetText, correctAnswer: q.targetText })}
        >
          ✅ I said it
        </button>
      </div>
      <p className="mt-1 text-center text-[11px] font-bold text-slate-400">Read the line out loud to attack</p>
    </div>
  )
}
