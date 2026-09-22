import { motion } from 'framer-motion'

/** Pixelated Boss Rush opponent — inline SVG sprite (no image assets).
 *  Frames: idle (bob), hurt (shake + red flash), defeated (fall + fade).
 *  `variant` shifts the hue per defeated boss so fights feel different. */
export function PixelBoss({
  phase,
  variant,
  hp,
  maxHp,
}: {
  phase: 'idle' | 'hurt' | 'defeated'
  variant: number
  hp: number
  maxHp: number
}) {
  const hue = (variant * 47) % 360
  const hurt = phase === 'hurt'
  const dead = phase === 'defeated'
  const body = hurt ? '#ef4444' : `hsl(${hue} 65% 52%)`
  const bodyDark = hurt ? '#b91c1c' : `hsl(${hue} 60% 38%)`
  const outline = '#1f2430'

  return (
    <motion.div
      className="mx-auto"
      style={{ width: 96, height: 96 }}
      animate={
        dead
          ? { y: 70, rotate: 25, opacity: 0, scale: 0.85 }
          : hurt
            ? { x: [0, -6, 6, -4, 4, 0], y: 0, opacity: 1, rotate: 0, scale: 1 }
            : { y: [0, -5, 0], x: 0, opacity: 1, rotate: 0, scale: 1 }
      }
      transition={
        dead
          ? { duration: 0.6, ease: 'easeIn' }
          : hurt
            ? { duration: 0.3 }
            : { y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } }
      }
      aria-label={dead ? 'Boss defeated' : hurt ? 'Boss hurt' : 'Boss'}
    >
      {/* Screen micro-shake when the boss lands its defeat */}
      {dead && (
        <motion.div
          className="fixed inset-x-0 top-1/3 -z-10 mx-auto h-1 w-1 rounded-full bg-red-400"
          initial={{ opacity: 0.9, scale: 3 }}
          animate={{ opacity: 0, scale: 8 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className="h-full w-full drop-shadow-md">
        {/* body */}
        <rect x="3" y="4" width="10" height="9" fill={body} />
        <rect x="3" y="4" width="10" height="1" fill={bodyDark} />
        <rect x="3" y="12" width="10" height="1" fill={bodyDark} />
        <rect x="3" y="4" width="1" height="9" fill={bodyDark} />
        <rect x="12" y="4" width="1" height="9" fill={bodyDark} />
        {/* horns */}
        <rect x="3" y="2" width="2" height="2" fill={bodyDark} />
        <rect x="11" y="2" width="2" height="2" fill={bodyDark} />
        <rect x="2" y="1" width="1" height="2" fill={outline} />
        <rect x="13" y="1" width="1" height="2" fill={outline} />
        {/* eyes — X when defeated, narrowed when hurt, square otherwise */}
        {dead ? (
          <>
            <rect x="5" y="6" width="1" height="1" fill={outline} />
            <rect x="6" y="7" width="1" height="1" fill={outline} />
            <rect x="5" y="8" width="1" height="1" fill={outline} />
            <rect x="7" y="7" width="1" height="1" fill={outline} />
            <rect x="9" y="6" width="1" height="1" fill={outline} />
            <rect x="10" y="7" width="1" height="1" fill={outline} />
            <rect x="9" y="8" width="1" height="1" fill={outline} />
            <rect x="11" y="7" width="1" height="1" fill={outline} />
          </>
        ) : hurt ? (
          <>
            <rect x="5" y="7" width="2" height="1" fill={outline} />
            <rect x="9" y="7" width="2" height="1" fill={outline} />
          </>
        ) : (
          <>
            <rect x="5" y="6" width="2" height="2" fill="#fff" />
            <rect x="9" y="6" width="2" height="2" fill="#fff" />
            <rect x="6" y="7" width="1" height="1" fill={outline} />
            <rect x="10" y="7" width="1" height="1" fill={outline} />
          </>
        )}
        {/* mouth */}
        <rect x="6" y="10" width="4" height="1" fill={outline} />
        {hurt && <rect x="5" y="9" width="6" height="1" fill="#7f1d1d" />}
        {/* outline frame */}
        <rect x="3" y="4" width="10" height="9" fill="none" stroke={outline} strokeWidth="0.5" />
        {/* HP pip row under the sprite is handled by the parent hearts bar */}
        {hp < maxHp && !dead && (
          <rect x="4" y="13" width={Math.round((hp / maxHp) * 8)} height="1" fill="#22c55e" />
        )}
      </svg>
    </motion.div>
  )
}
