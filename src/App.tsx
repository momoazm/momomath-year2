import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { startCloudSync } from './engine/cloudsave'
import { readUnlockParam } from './engine/unlock'
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
import { BookScreen } from './screens/BookScreen'
import { UnitActivityScreen } from './screens/UnitActivityScreen'
import { FriendsScreen } from './screens/FriendsScreen'
import { SprintScreen } from './screens/SprintScreen'
import { getCurriculum } from './content/registry'
import { usePlayer } from './engine/store'
import { applyDocumentTitle } from './engine/branding'
import type { RetryItem } from './engine/adaptive'
import { BOOKS_BY_ID } from './content/english/books'
import { WelcomeGate } from './components/ui/WelcomeGate'
import { AutoLeagueSettle } from './components/ui/AutoLeagueSettle'
import { Scenery } from './components/ui/Scenery'
import { MascotGallery } from './components/mascots/Gallery'

export default function App() {
  const [tab, setTab] = useState<Tab>('path')
  const [activeBattle, setActiveBattle] = useState<{ lessonId: string; epoch: number } | null>(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showFriends, setShowFriends] = useState(
    () => new URLSearchParams(window.location.search).has('friends'),
  )
  const [reviewLesson, setReviewLesson] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('lesson'),
  )
  const [activeActivity, setActiveActivity] = useState<string | null>(null)
  /** Wrong-question practice round (snapshots from the adaptive tracker). */
  const [retryItems, setRetryItems] = useState<RetryItem[] | null>(null)
  /** true when retryItems came from the daily check-up (XP-only too, but the
   *  intro copy differs). Reset on exit so a later retry round is normal. */
  const [retryCheckup, setRetryCheckup] = useState(false)
  /** WS16 - Flashcard Sprint overlay (standalone full-screen round). */
  const [sprintOpen, setSprintOpen] = useState(false)
  const subject = usePlayer((s) => s.subject)
  const yearLevel = usePlayer((s) => s.yearLevel)
  /** PLAN 161 — transient banner after a ?unlock= magic-link apply. */
  const [unlockToast, setUnlockToast] = useState<string | null>(null)
  const [reviewBook, setReviewBook] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('book'),
  )

  useEffect(() => {
    startCloudSync()
  }, [])

  // PLAN 160 — the tab title follows the active year (166 extends branding).
  useEffect(() => {
    applyDocumentTitle(yearLevel)
  }, [yearLevel])

  // PLAN 161 — ?unlock= magic link: validate, persist, celebrate, clear the
  // param. Invalid or already-unlocked links are silently cleared.
  useEffect(() => {
    const search = window.location.search
    if (!search.includes('unlock')) return
    const ok = readUnlockParam(search)
    const params = new URLSearchParams(search)
    params.delete('unlock')
    const qs = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`)
    if (!ok || usePlayer.getState().extrasUnlocked) return
    usePlayer.getState().setExtrasUnlocked(true)
    setUnlockToast('🎉 Extra subjects unlocked!')
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, disableForReducedMotion: true })
    const t = window.setTimeout(() => setUnlockToast(null), 4000)
    return () => window.clearTimeout(t)
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

  // Friends + referral codes: Profile-section entry (and ?friends deep link)
  if (showFriends) {
    return (
      <>
        <TopBar onLeagueClick={() => setTab('leagues')} onLibraryClick={() => setShowLibrary(true)} />
        <FriendsScreen
          onClose={() => {
            setShowFriends(false)
            if (new URLSearchParams(window.location.search).has('friends')) {
              const url = new URL(window.location.href)
              url.searchParams.delete('friends')
              window.history.replaceState({}, '', url.toString())
            }
          }}
        />
      </>
    )
  }

  // WS16 - Flashcard Sprint overlay: standalone 60-second round.
  if (sprintOpen) {
    return <SprintScreen onExit={() => setSprintOpen(false)} />
  }

  // Daily check-up entry (Path banner + Profile card): runs in the plain
  // LessonScreen with the exact snapshot queue - XP only, no battle/crowns.
  function startCheckup(items: RetryItem[]) {
    if (items.length === 0) return
    setRetryItems(items)
    setRetryCheckup(true)
  }

  // Daily check-up / wrong-question practice: plain LessonScreen session with
  // the snapshot queue (no lesson entry, XP only, no chest).
  if (retryItems && retryItems.length > 0) {
    return (
      <LessonScreen
        lessonId={retryItems[0]?.lessonId ?? ''}
        retryItems={retryItems}
        checkup={retryCheckup}
        onExit={() => { setRetryItems(null); setRetryCheckup(false) }}
      />
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

  // Unit storybook reader: state-set from the roadmap node, or ?book=<id> deep link
  if (reviewBook && BOOKS_BY_ID[reviewBook] && !activeBattle) {
    return (
      <BookScreen
        book={BOOKS_BY_ID[reviewBook]}
        onExit={() => {
          const url = new URL(window.location.href)
          url.searchParams.delete('book')
          window.history.replaceState({}, '', url.toString())
          setReviewBook(null)
        }}
      />
    )
  }

  // 🎯 Unit fun-activity mini-game (PLAN 104): opens from the unit's 🎯 node
  if (activeActivity) {
    const unit = getCurriculum(subject, yearLevel).units.find((u) => u.id === activeActivity)
    if (unit) {
      return (
        <UnitActivityScreen
          key={activeActivity}
          unit={unit}
          subject={subject}
          onExit={() => setActiveActivity(null)}
        />
      )
    }
  }

  // Path node tap → BattleScreen for all lesson/boss nodes
  if (activeBattle) {
    return (
      <BattleScreen
        key={`${activeBattle.lessonId}:${activeBattle.epoch}`}
        lessonId={activeBattle.lessonId}
        epoch={activeBattle.epoch}
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
    onOpenBook={(id) => setReviewBook(id)}
    onOpenActivity={(id) => setActiveActivity(id)}
    onStartCheckup={startCheckup}
    onStartSprint={() => setSprintOpen(true)}
  />
)}
      {tab === 'shop' && <ShopScreen />}
      {tab === 'leagues' && <LeaguesScreen />}
      {tab === 'quests' && <QuestsScreen />}
      {tab === 'arcade' && <ArcadeScreen />}
      {tab === 'profile' && (
        <ProfileScreen onOpenFriends={() => setShowFriends(true)} onStartCheckup={startCheckup} />
      )}
        </motion.main>
        </AnimatePresence>
        {unlockToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
            data-testid="unlock-toast"
          >
            <div className="rounded-xl bg-slate-800/90 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              {unlockToast}
            </div>
          </motion.div>
        )}
        <BottomNav tab={tab} onTab={setTab} />
      </div>
    </div>
  )
}
