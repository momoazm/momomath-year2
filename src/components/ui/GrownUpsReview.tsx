import { useState } from 'react'
import { usePlayer } from '../../engine/store'
import {
  BYOK_PROVIDERS,
  byokClear,
  byokGet,
  byokMask,
  byokSet,
  fetchReview,
  summariseSkill,
  type AdaptiveSnapshot,
  type AttemptLogEntry,
  type ReviewResponse,
  type ReviewStats,
  type SkillSummary,
} from '../../engine/adaptive'
import { sfx } from '../../engine/sfx'

/** Grown-ups-only section for the Profile screen: optional BYOK key form +
 *  AI review of aggregate practice stats. Never rendered to the child —
 *  Profile is the parent-facing screen. The review grounds every statement
 *  in real numbers; offline it degrades to a labelled "Offline summary". */
export function GrownUpsReview() {
  const s = usePlayer()
  const [refresh, setRefresh] = useState(0)

  const insights: SkillSummary[] = Object.keys(s.adaptive.snapshot.skills)
    .map((code) => summariseSkill(code, s.adaptive.snapshot))
    .filter((x): x is SkillSummary => x !== null)
    .sort((a, b) => a.mastery - b.mastery)

  const stats: ReviewStats = buildStats(s, insights)

  return (
    <div className="space-y-3">
      <ByokForm onChange={() => setRefresh((n) => n + 1)} />
      <ReviewCard key={refresh} stats={stats} />
    </div>
  )
}

function buildStats(
  s: { adaptive: { snapshot: AdaptiveSnapshot; attempts: AttemptLogEntry[] }; streakCurrent: number },
  insights: SkillSummary[],
): ReviewStats {
  const attempts = s.adaptive.attempts
  const correct = attempts.filter((a) => a.correct).length
  return {
    attempted: attempts.length,
    accuracyPct: attempts.length ? Math.round((correct / attempts.length) * 100) : null,
    avgSeconds: attempts.length
      ? Math.round(attempts.reduce((n, a) => n + a.responseTimeMs, 0) / attempts.length / 1000)
      : null,
    streakDays: s.streakCurrent,
    weakSkills: insights.slice(0, 3).map((i) => ({
      code: i.code,
      masteryPct: Math.round(i.mastery * 100),
    })),
    strongSkills: insights
      .slice(-3)
      .reverse()
      .map((i) => ({ code: i.code, masteryPct: Math.round(i.mastery * 100) })),
  }
}

function ByokForm({ onChange }: { onChange: () => void }) {
  const saved = byokGet()
  const [provider, setProvider] = useState(saved?.provider ?? 'gemini')
  const [keyInput, setKeyInput] = useState('')
  const [status, setStatus] = useState('')

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-slate-400">
        Optional: your own free AI key
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-500">
        The app works without this (shared server keys). Add yours for faster, more reliable
        reviews — it stays in this browser only.
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold outline-none"
          aria-label="AI provider"
        >
          {BYOK_PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Paste key (stays in this browser)"
          autoComplete="off"
          className="rounded-xl border-2 border-slate-200 px-3 py-2 text-sm outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              sfx.tap()
              if (keyInput.trim().length < 16) {
                setStatus('That looks too short — copy the whole key.')
                return
              }
              byokSet(provider, keyInput.trim())
              setKeyInput('')
              setStatus('Saved in this browser.')
              onChange()
            }}
            className="btn3d btn-green flex-1 !px-3 !py-2 !text-sm"
          >
            Save key
          </button>
          <button
            onClick={() => {
              sfx.tap()
              byokClear()
              setStatus('Key removed.')
              onChange()
            }}
            className="btn3d btn-grey flex-1 !px-3 !py-2 !text-sm"
          >
            Remove
          </button>
        </div>
        {saved ? (
          <p className="text-xs font-bold text-emerald-600">
            Saved: {saved.provider} · {byokMask()}
          </p>
        ) : null}
        {status ? <p className="text-xs font-bold text-slate-500">{status}</p> : null}
      </div>
    </div>
  )
}

function ReviewCard({ stats }: { stats: ReviewStats }) {
  const [out, setOut] = useState<ReviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (out) {
    const r = out.review
    return (
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-slate-400">
          {out.source === 'llm' ? '✨ AI review' : 'Offline summary'}
          {out.provider ? ` · ${out.provider}` : ''}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-700">{r.summary}</p>
        {r.strengths.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm font-bold text-slate-500">
            {r.strengths.map((x) => (
              <li key={x}>💪 {x}</li>
            ))}
          </ul>
        )}
        <ul className="mt-2 space-y-1 text-sm font-bold text-slate-500">
          {r.focus.map((f) => (
            <li key={f.area}>
              🎯 <span className="text-slate-700">{f.area}:</span> {f.action}
            </li>
          ))}
        </ul>
        <p className="mt-2 rounded-xl bg-white p-2 text-sm font-bold text-slate-700">
          Next step: {r.nextStep}
        </p>
        {r.motivation ? (
          <p className="mt-1 text-xs font-bold italic text-slate-400">{r.motivation}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <button
        disabled={loading}
        onClick={async () => {
          sfx.tap()
          setLoading(true)
          setError('')
          try {
            setOut(await fetchReview(stats))
          } catch (e) {
            setError(e instanceof Error ? e.message.slice(0, 120) : 'Something went wrong.')
          } finally {
            setLoading(false)
          }
        }}
        className="btn3d btn-green w-full !px-3 !py-2.5 !text-sm disabled:opacity-50"
      >
        {loading ? '✨ Analysing…' : '✨ AI review for grown-ups'}
      </button>
      {error ? (
        <div className="mt-2 flex items-center gap-2">
          <p className="flex-1 text-xs font-bold text-red-500">{error}</p>
          <button
            onClick={() => {
              setError('')
              setLoading(false)
            }}
            className="btn3d btn-grey !px-3 !py-1.5 !text-xs"
          >
            Retry
          </button>
        </div>
      ) : null}
      {stats.attempted === 0 && (
        <p className="mt-1 text-xs font-semibold text-slate-400">
          No practice yet — the review appears after the first lesson.
        </p>
      )}
    </div>
  )
}
