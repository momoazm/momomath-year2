type Tab = 'path' | 'shop' | 'leagues' | 'quests' | 'arcade' | 'profile'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'path', icon: '🏁', label: 'Path' },
  { id: 'shop', icon: '🛍️', label: 'Shop' },
  { id: 'leagues', icon: '🏆', label: 'Leagues' },
  { id: 'quests', icon: '📜', label: 'Quests' },
  { id: 'arcade', icon: '🕹️', label: 'Arcade' },
  { id: 'profile', icon: '🦔', label: 'You' },
]

export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-xl items-stretch justify-around px-1 pb-0.5 pt-1">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1 font-display text-[10px] font-bold uppercase leading-none tracking-tight transition-all ${
                active
                  ? 'bg-speed-bluelight text-speed-blue shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`text-[19px] leading-none transition-transform ${active ? 'scale-110' : ''}`}>{t.icon}</span>
              <span className="w-full truncate text-center">{t.label}</span>
              {active && <span className="absolute -top-[5px] h-1 w-6 rounded-full bg-speed-blue" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export type { Tab }
