import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TopBar } from './components/ui/TopBar'
import { BottomNav, type Tab } from './components/ui/BottomNav'
import { PathScreen } from './screens/PathScreen'
import { LessonScreen } from './screens/LessonScreen'
import { LeaguesScreen } from './screens/LeaguesScreen'
import { QuestsScreen } from './screens/QuestsScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ShopScreen } from './screens/ShopScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { WelcomeGate } from './components/ui/WelcomeGate'
import { Scenery } from './components/ui/Scenery'
import { MascotGallery } from './components/mascots/Gallery'

export default function App() {
  const [tab, setTab] = useState<Tab>('path')
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  if (new URLSearchParams(window.location.search).has('gallery')) {
    return <MascotGallery />
  }

  if (new URLSearchParams(window.location.search).has('library')) {
    return <LibraryScreen />
  }

  if (activeLesson) {
    return <LessonScreen lessonId={activeLesson} onExit={() => setActiveLesson(null)} />
  }

  return (
    <div className="relative min-h-[100dvh] pb-20">
      <Scenery />
      <div className="relative z-10">
        <WelcomeGate />
        <TopBar onLeagueClick={() => setTab('leagues')} />
      <AnimatePresence mode="wait">
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
{tab === 'path' && <PathScreen onStartLesson={(id) => setActiveLesson(id)} />}
      {tab === 'shop' && <ShopScreen />}
      {tab === 'leagues' && <LeaguesScreen />}
      {tab === 'quests' && <QuestsScreen />}
      {tab === 'profile' && <ProfileScreen />}
        </motion.main>
        </AnimatePresence>
        <BottomNav tab={tab} onTab={setTab} />
      </div>
    </div>
  )
}
