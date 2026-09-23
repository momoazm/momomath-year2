import { useEffect, useState } from 'react'
import { startCloudSync } from './engine/cloudsave'
import { AnimatePresence, motion } from 'framer-motion'
import { TopBar } from './components/ui/TopBar'
import { BottomNav, type Tab } from './components/ui/BottomNav'
import { PathScreen } from './screens/PathScreen'
import { LessonScreen } from './screens/LessonScreen'
import { BattleScreen } from './screens/BattleScreen'
import { LeaguesScreen } from './screens/LeaguesScreen'
import { QuestsScreen } from './screens/QuestsScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ShopScreen } from './screens/ShopScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { ArcadeScreen } from './screens/ArcadeScreen'
import { WelcomeGate } from './components/ui/WelcomeGate'
import { AutoLeagueSettle } from './components/ui/AutoLeagueSettle'
import { Scenery } from './components/ui/Scenery'
import { MascotGallery } from './components/mascots/Gallery'

export default function App() {
  const [tab, setTab] = useState<Tab>('path')
  const [activeBattle, setActiveBattle] = useState<{ lessonId: string; epoch: number } | null>(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [reviewLesson, setReviewLesson] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('lesson'),
  )

  useEffect(() => {
    startCloudSync()
  }, [])

  if (new URLSearchParams(window.location.search).has('gallery')) {
    return <MascotGallery />
  }

  if (new URLSearchParams(window.location.search).has('library') || showLibrary) {
    return (
      <>
        <TopBar onLeagueClick={() => setTab('leagues')} onLibraryClick={() => setShowLibrary(true)} />
        <LibraryScreen
          onClose={() => {
            setShowLibrary(false)
            if (new URLSearchParams(window.location.search).has('library')) {
              const url = new URL(window.location.href)
              url.searchParams.delete('library')
              window.history.replaceState({}, '', url.toString())
            }
          }}
        />
      </>
    )
  }

  // Plain LessonScreen review: only reachable via ?lesson=<id>
  if (reviewLesson && !activeBattle) {
    return (
      <LessonScreen
        lessonId={reviewLesson}
        onExit={() => {
          const url = new URL(window.location.href)
          url.searchParams.delete('lesson')
          window.history.replaceState({}, '', url.toString())
          setReviewLesson(null)
        }}
      />
    )
  }

  // Path node tap → BattleScreen for all lesson/boss nodes
  if (activeBattle) {
    return (
      <BattleScreen
        key={`${activeBattle.lessonId}:${activeBattle.epoch}`}
        lessonId={activeBattle.lessonId}
        onExit={() => setActiveBattle(null)}
        onRetry={() => setActiveBattle((b) => (b ? { ...b, epoch: b.epoch + 1 } : b))}
        onVictoryContinue={() => setActiveBattle(null)}
      />
    )
  }

  return (
    <div className="relative min-h-[100dvh] pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <Scenery />
      <div className="relative z-10">
        <WelcomeGate />
        <AutoLeagueSettle />
        <TopBar onLeagueClick={() => setTab('leagues')} onLibraryClick={() => setShowLibrary(true)} />
      <AnimatePresence mode="wait">
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
{tab === 'path' && (
  <PathScreen
    onStartLesson={(id) => setActiveBattle({ lessonId: id, epoch: 0 })}
  />
)}
      {tab === 'shop' && <ShopScreen />}
      {tab === 'leagues' && <LeaguesScreen />}
      {tab === 'quests' && <QuestsScreen />}
      {tab === 'arcade' && <ArcadeScreen />}
      {tab === 'profile' && <ProfileScreen />}
        </motion.main>
        </AnimatePresence>
        <BottomNav tab={tab} onTab={setTab} />
      </div>
    </div>
  )
}
