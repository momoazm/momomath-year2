import { useState } from 'react'
import { MASCOTS } from './Mascots'
import type { Expression, MascotId } from '../../content/types'

const EXPRESSIONS: Expression[] = ['happy', 'excited', 'sad', 'thinking', 'cheer']

/** Dev-only gallery: /?gallery=1 shows every character & expression. */
export function MascotGallery() {
  const [ex, setEx] = useState<Expression>('happy')
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-center font-display text-2xl font-extrabold text-speed-blue">Mascot gallery (dev)</h1>
      <div className="mt-3 flex justify-center gap-2">
        {EXPRESSIONS.map((e) => (
          <button
            key={e}
            onClick={() => setEx(e)}
            className={`rounded-full px-3 py-1 font-display text-xs font-extrabold ${
              ex === e ? 'bg-speed-blue text-white' : 'bg-white text-slate-500'
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {(Object.keys(MASCOTS) as MascotId[]).map((id) => (
          <div key={id} className="card-white text-center">
            <div className="mx-auto h-32 w-32">
              {MASCOTS[id]({ expression: ex })}
            </div>
            <p className="mt-1 font-display text-sm font-extrabold capitalize text-slate-500">{id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
