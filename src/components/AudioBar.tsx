import { sfx } from '../engine/sfx'
import { speakFor, speakSlowFor, ttsAvailable } from '../engine/tts'
import { usePlayer } from '../engine/store'

/** 🔊 Listen + 🐢 slow replay for audioText questions (listening exercises).
 *  Shared by LessonScreen (plain quiz) and QuestionView (battle). */
export function AudioBar({ audioText }: { audioText: string }) {
  const subject = usePlayer((s) => s.subject)
  if (!ttsAvailable()) return null
  return (
    <div className="mx-auto mt-2 flex w-fit items-center gap-2">
      <button
        onClick={() => { sfx.tap('audio'); speakFor(subject, audioText) }}
        className="btn3d btn-blue flex items-center gap-2 !px-5 !py-3 text-xl"
        title="Play again"
      >
        🔊 Listen
      </button>
      <button
        onClick={() => { sfx.tap('slow'); speakSlowFor(subject, audioText) }}
        className="btn3d btn-grey !px-4 !py-3 text-xl"
        title="Slow replay (turtle mode)"
      >
        🐢
      </button>
    </div>
  )
}
