import { usePlayer } from '../../engine/store'
import { LEAGUE_META } from '../../engine/gamification'
import { ENERGY_IS_UNLIMITED } from '../../engine/store'
import { AuthBadge } from './AuthBadge'
import { useAuth } from '../../engine/auth'
import { sfx } from '../../engine/sfx'
import type { Subject } from '../../content/types'

const SUBJECTS: { id: Subject; icon: string; label: string; activeBg: string }[] = [
  { id: 'math', icon: '🧮', label: 'Maths', activeBg: 'bg-speed-blue text-white' },
  { id: 'english', icon: '📚', label: 'English', activeBg: 'bg-[#ff9600] text-white' },
]

function SubjectSwitch() {
  const subject = usePlayer((s) => s.subject)
  const setSubject = usePlayer((s) => s.setSubject)
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white bg-white/90 p-0.5 shadow-sm" title="Switch subject">
      {SUBJECTS.map((s) => (
        <button
          key={s.id}
          onClick={() => {
            if (subject !== s.id) {
              sfx.whoosh()
              setSubject(s.id)
            }
          }}
          className={`grid h-7 w-7 place-items-center rounded-full text-sm font-display transition-colors ${
            subject === s.id ? `${s.activeBg} shadow-sm` : 'hover:bg-slate-100'
          }`}
          aria-pressed={subject === s.id}
          aria-label={s.label}
        >
          {s.icon}
        </button>
      ))}
    </div>
  )
}

function Pill({ icon, iconBg, value, title, valueClass }: { icon: string; iconBg: string; value: string | number; title: string; valueClass: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white bg-white/90 py-0.5 pl-0.5 pr-2.5 shadow-sm" title={title}>
      <span className={`grid h-6 w-6 place-items-center rounded-full text-sm ${iconBg}`}>{icon}</span>
      <span className={`font-display text-base font-extrabold ${valueClass}`}>{value}</span>
    </div>
  )
}

export function TopBar({ onLeagueClick }: { onLeagueClick?: () => void }) {
  const s = usePlayer()
  const user = useAuth((a) => a.user)
  const league = LEAGUE_META[s.currentLeague]
  return (
    <header className="sticky top-0 z-30 mx-auto flex w-full max-w-xl items-center justify-between gap-2 border-b-2 border-white/60 bg-white/70 px-3 py-2 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <SubjectSwitch />
        <Pill icon="🔥" iconBg="bg-orange-100" value={s.streakCurrent} title="Daily streak" valueClass="text-orange-500" />
        <Pill icon="💎" iconBg="bg-yellow-100" value={s.gems} title="Gems" valueClass="text-yellow-500" />
      </div>

      <button
        onClick={onLeagueClick}
        className="flex items-center gap-1.5 rounded-full border border-white bg-white/90 px-2.5 py-1 shadow-sm transition-colors hover:bg-white"
        title={`Weekly league: ${s.currentLeague}`}
      >
        <span>{league.icon}</span>
        <span className="font-display text-sm font-extrabold" style={{ color: league.color }}>
          {s.currentLeague}
        </span>
      </button>

      <div className="flex items-center gap-2">
        {user && <AuthBadge />}
        {ENERGY_IS_UNLIMITED && (
          <div
            className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-2.5 py-0.5 font-display text-xs font-extrabold text-white shadow-sm"
            title="Energy is unlimited for everyone!"
          >
            ∞
          </div>
        )}
      </div>
    </header>
  )
}
