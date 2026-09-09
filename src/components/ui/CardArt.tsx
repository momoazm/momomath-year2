import { useState } from 'react'
import { CARD_IMAGE } from '../../engine/cards'
import { Mascot } from '../mascots/Mascots'
import type { Expression, MascotId } from '../../content/types'

interface CardArtProps {
  /** unique card id (variant cards share their character's fallback) */
  cardId: string
  character: MascotId
  expression?: Expression
  className?: string
}

/** Real character image for a card, with the SVG mascot as offline-proof fallback. */
export function CardArt({ cardId, character, expression = 'happy', className }: CardArtProps) {
  const [failed, setFailed] = useState(false)
  const src = CARD_IMAGE[cardId]
  if (!failed && src) {
    return (
      <img
        src={src}
        alt={cardId}
        draggable={false}
        onError={() => setFailed(true)}
        className={className ?? 'h-full w-full object-contain drop-shadow-lg'}
      />
    )
  }
  return <Mascot id={character} expression={expression} />
}
