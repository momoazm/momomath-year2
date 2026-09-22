import { usePlayer } from './store'

/** Shared end-of-round payout for every arcade game: persist the score,
 *  award XP/gems (0 when score is 0), feed daily-quest counters, and
 *  evaluate exclusive-card unlocks via recordArcadeRound.
 *  Returns the payout so the game-over screen can render it. */
export function finishArcadeRound(
  gameId: string,
  score: number,
  bossesDown = 0,
): { xp: number; gems: number; granted: string[] } {
  const st = usePlayer.getState()
  st.submitArcadeScore(gameId, score)
  const xp = score > 0 ? Math.min(30, Math.max(5, Math.round(score / 10))) : 0
  const gems = score > 0 ? Math.min(20, Math.max(2, Math.round(score / 20))) : 0
  if (score > 0) {
    st.addGems(gems)
    st.addArcadeCorrect(Math.min(score, 100))
    st.addArcadeXp(xp)
  }
  const granted = st.recordArcadeRound(gameId, bossesDown)
  return { xp, gems, granted }
}
