type Tab = 'path' | 'shop' | 'leagues' | 'quests' | 'profile'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'path', icon: '🏁', label: 'Path' },
  { id: 'shop', icon: '🛍️', label: 'Shop' },
  { id: 'leagues', icon: '🏆', label: 'Leagues' },
  { id: 'quests', icon: '📜', label: 'Quests' },
  { id: 'profile', icon: '🦔', label: 'You' },
]

export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-stretch justify-around px-2 py-1.5">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`gpu relative flex flex-col items-center rounded-2xl px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition-all ${
                active
                  ? 'bg-speed-bluelight text-speed-blue shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>{t.icon}</span>
              {t.label}
              {active && <span className="absolute -top-[7px] h-1 w-8 rounded-full bg-speed-blue" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export type { Tab }
