import { usePlayer } from '../../engine/store'
import { LEAGUE_META, displayStreak, isStreakActive } from '../../engine/gamification'
import { ENERGY_IS_UNLIMITED } from '../../engine/store'
import { AuthBadge } from './AuthBadge'
import { useAuth } from '../../engine/auth'
import { sfx } from '../../engine/sfx'
import type { Subject } from '../../content/types'

const SUBJECTS: { id: Subject; icon: string; label: string; activeBg: string }[] = [
  { id: 'math', icon: '🧮', label: 'Maths', activeBg: 'bg-speed-blue text-white' },
  { id: 'english', icon: '📚', label: 'English', activeBg: 'bg-[#ff9600] text-white' },
  { id: 'science', icon: '🔬', label: 'Science', activeBg: 'bg-emerald-500 text-white' },
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
    <div className="flex items-center gap-1 rounded-full border border-white bg-white/90 py-0.5 pl-0.5 pr-1.5 shadow-sm sm:gap-1.5 sm:pr-2.5" title={title}>
      <span className={`grid h-5 w-5 place-items-center rounded-full text-xs sm:h-6 sm:w-6 sm:text-sm ${iconBg}`}>{icon}</span>
      <span className={`font-display text-sm font-extrabold sm:text-base ${valueClass}`}>{value}</span>
    </div>
  )
}

export function TopBar({ onLeagueClick, onLibraryClick }: { onLeagueClick?: () => void; onLibraryClick?: () => void }) {
  const s = usePlayer()
  const user = useAuth((a) => a.user)
  const league = LEAGUE_META[s.currentLeague]
  // Streak only lights up after a lesson is completed TODAY. Otherwise the
  // pill shows "—" so yesterday's count doesn't carry over before the first
  // lesson of the new day.
  const streakOn = isStreakActive(s)
  const streakValue = streakOn ? displayStreak(s) : 0
  const streakTitle = streakOn
    ? 'Daily streak'
    : 'Streak lights up when you complete a lesson today'
  return (
    <header className="sticky top-0 z-30 mx-auto flex w-full max-w-xl flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b-2 border-white/60 bg-white/70 px-2 py-1.5 backdrop-blur-md sm:px-4">
      <div className="flex min-w-0 items-center gap-1.5">
        <SubjectSwitch />
        <Pill
          icon="🔥"
          iconBg={streakOn ? 'bg-orange-100' : 'bg-slate-100'}
          value={streakOn ? streakValue : '—'}
          title={streakTitle}
          valueClass={streakOn ? 'text-orange-500' : 'text-slate-400'}
        />
        <Pill icon="💎" iconBg="bg-yellow-100" value={s.gems} title="Gems" valueClass="text-yellow-500" />
      </div>

      <button
        onClick={onLeagueClick}
        className="flex shrink-0 items-center gap-1 rounded-full border border-white bg-white/90 px-2 py-1 shadow-sm transition-colors hover:bg-white"
        title={`Weekly league: ${s.currentLeague}`}
      >
        <span className="text-base leading-none">{league.icon}</span>
        <span className="hidden font-display text-xs font-extrabold sm:inline" style={{ color: league.color }}>
          {s.currentLeague}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        {user && <AuthBadge />}
        {ENERGY_IS_UNLIMITED && (
          <div
            className="hidden rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-2.5 py-0.5 font-display text-xs font-extrabold text-white shadow-sm sm:block"
            title="Energy is unlimited for everyone!"
          >
            ∞
          </div>
        )}
        <button
          onClick={onLibraryClick}
          className="grid h-8 w-8 place-items-center rounded-full border border-white bg-white/90 text-lg shadow-sm transition-colors hover:bg-white hover:scale-105 sm:h-9 sm:w-9 sm:text-xl"
          title="Card Library"
          aria-label="Card Library"
        >
          🃏
        </button>
      </div>
    </header>
  )
}
