import { usePlayer } from '../../engine/store'
import { LEAGUE_META, displayStreak, isStreakActive } from '../../engine/gamification'
import { ENERGY_IS_UNLIMITED } from '../../engine/store'
import { AuthBadge } from './AuthBadge'
import { useAuth } from '../../engine/auth'
import { sfx } from '../../engine/sfx'
import type { Subject } from '../../content/types'

const CORE_SUBJECTS: { id: Subject; icon: string; label: string; activeBg: string }[] = [
  { id: 'math', icon: '🧮', label: 'Maths', activeBg: 'bg-speed-blue text-white' },
  { id: 'english', icon: '📚', label: 'English', activeBg: 'bg-[#ff9600] text-white' },
  { id: 'science', icon: '🔬', label: 'Science', activeBg: 'bg-emerald-500 text-white' },
]

const GERMAN_EXTRA: { id: Subject; icon: string; label: string; activeBg: string } = {
  id: 'german',
  icon: '🇩🇪',
  label: 'Deutsch (optional extra)',
  activeBg: 'bg-[#00a651] text-white',
}

const ARABIC_EXTRA: { id: Subject; icon: string; label: string; activeBg: string } = {
  id: 'arabic',
  icon: '🇪🇬',
  label: 'العربية (optional extra)',
  activeBg: 'bg-[#c09300] text-white',
}

const RELIGION_EXTRA: { id: Subject; icon: string; label: string; activeBg: string } = {
  id: 'religion',
  icon: '🕌',
  label: 'الدين (optional extra)',
  activeBg: 'bg-[#0d7a5f] text-white',
}

const SOCIAL_EXTRA: { id: Subject; icon: string; label: string; activeBg: string } = {
  id: 'social',
  icon: '🗺️',
  label: 'دراسات (optional extra)',
  activeBg: 'bg-[#b3541e] text-white',
}

const ALL_SUBJECTS: { id: Subject; icon: string; label: string; activeBg: string; short: string }[] = [
  ...CORE_SUBJECTS.map((s) => ({ ...s, short: s.label })),
  { ...GERMAN_EXTRA, short: 'DE' },
  { ...ARABIC_EXTRA, short: 'ع' },
  { ...RELIGION_EXTRA, short: 'دين' },
  { ...SOCIAL_EXTRA, short: 'دراسات' },
]

function SubjectSwitch() {
  const subject = usePlayer((s) => s.subject)
  const setSubject = usePlayer((s) => s.setSubject)
  // Full-width capsule: fills leftover navbar space, scrolls horizontally when needed.
  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full border border-white bg-white/90 p-0.5 shadow-sm [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Choose roadmap"
      title="Slide to switch roadmap"
    >
      {ALL_SUBJECTS.map((s) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={subject === s.id}
          onClick={() => {
            if (subject !== s.id) {
              sfx.whoosh()
              setSubject(s.id)
            }
          }}
          className={`flex h-7 shrink-0 items-center gap-1 rounded-full px-1.5 font-display text-sm font-extrabold transition-colors ${
            subject === s.id ? `${s.activeBg} shadow-sm` : 'hover:bg-slate-100 text-slate-500'
          }`}
          aria-label={s.label}
          title={s.label}
        >
          <span aria-hidden>{s.icon}</span>
          <span className="hidden text-xs min-[480px]:inline">{s.short}</span>
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
    <header className="sticky top-0 z-30 mx-auto flex w-full max-w-xl items-center justify-between gap-1.5 overflow-hidden border-b-2 border-white/60 bg-white/70 px-2 py-2 backdrop-blur-md sm:gap-2 sm:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        {/* Horizontal roadmap slider — all 7 subjects, fills available width */}
        <SubjectSwitch />
        <div className="hidden shrink-0 items-center gap-1.5 min-[420px]:flex sm:gap-2">
          <Pill
            icon="🔥"
            iconBg={streakOn ? 'bg-orange-100' : 'bg-slate-100'}
            value={streakOn ? streakValue : '—'}
            title={streakTitle}
            valueClass={streakOn ? 'text-orange-500' : 'text-slate-400'}
          />
          <Pill icon="💎" iconBg="bg-yellow-100" value={s.gems} title="Gems" valueClass="text-yellow-500" />
        </div>
      </div>

      <button
        onClick={onLeagueClick}
        className="flex min-w-0 shrink-0 items-center gap-1.5 rounded-full border border-white bg-white/90 px-2 py-1 shadow-sm transition-colors hover:bg-white sm:gap-1.5 sm:px-2.5"
        title={`Weekly league: ${s.currentLeague}`}
      >
        <span className="shrink-0">{league.icon}</span>
        <span
          className="max-w-[4.5rem] truncate font-display text-sm font-extrabold sm:max-w-[7rem]"
          style={{ color: league.color }}
        >
          {s.currentLeague}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {user && <AuthBadge />}
        {ENERGY_IS_UNLIMITED && (
          <div
            className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-2 py-0.5 font-display text-xs font-extrabold text-white shadow-sm sm:px-2.5"
            title="Energy is unlimited for everyone!"
          >
            ∞
          </div>
        )}
        <button
          onClick={onLibraryClick}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white bg-white/90 text-xl shadow-sm transition-colors hover:bg-white hover:scale-105"
          title="Card Library"
          aria-label="Card Library"
        >
          🃏
        </button>
      </div>
    </header>
  )
}
