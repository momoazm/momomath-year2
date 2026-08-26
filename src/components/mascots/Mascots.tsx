import type { Expression, MascotProps } from '../../content/types'

const LINE = '#2b2540'

/* ----------------------------- shared bits ----------------------------- */

function Frame({ children, shine }: { children: React.ReactNode; shine?: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-md" role="img" aria-hidden>
      {shine && (
        <defs>
          <radialGradient id={shine} cx="50%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {children}
      {shine && <circle cx="60" cy="52" r="34" fill={`url(#${shine})`} />}
    </svg>
  )
}

function GroundShadow() {
  return <ellipse cx="60" cy="115" rx="25" ry="3.6" fill="#0b1c3a" opacity="0.13" />
}

type EyeOpts = {
  iris?: string
  shiftX?: number
  shiftY?: number
  scale?: number
}

/** Sonic-style connected eye mass (two fused ovals). */
function HedgehogEyes({ ex, iris, cx = 60, cy = 47, s = 1 }: { ex: Expression; iris?: string } & EyeOpts & { cx?: number; cy?: number; s?: number }) {
  const pupil = iris ? '#20242e' : '#2b2540'
  const dot = iris ?? pupil
  if (ex === 'sad') {
    return (
      <g>
        <path
          d={`M ${cx - 21} ${cy - 2} C ${cx - 20} ${cy - 13} ${cx - 12} ${cy - 17} ${cx - 5} ${cy - 13} C ${cx - 2} ${cy - 11} ${cx - 1} ${cy - 9} ${cx} ${cy - 8} C ${cx + 1} ${cy - 9} ${cx + 2} ${cy - 11} ${cx + 5} ${cy - 13} C ${cx + 12} ${cy - 17} ${cx + 20} ${cy - 13} ${cx + 21} ${cy - 2} C ${cx + 22} ${cy + 8} ${cx + 16} ${cy + 15} ${cx + 9} ${cy + 14} C ${cx + 4} ${cy + 13} ${cx + 1} ${cy + 9} ${cx} ${cy + 6} C ${cx - 1} ${cy + 9} ${cx - 4} ${cy + 13} ${cx - 9} ${cy + 14} C ${cx - 16} ${cy + 15} ${cx - 22} ${cy + 8} ${cx - 21} ${cy - 2} Z`}
          fill="#fff"
          stroke={LINE}
          strokeWidth="2"
        />
        <path d={`M ${cx - 21} ${cy - 4} Q ${cx - 10} ${cy - 14} ${cx} ${cy - 8} Q ${cx + 10} ${cy - 14} ${cx + 21} ${cy - 4} L ${cx + 21} ${cy - 12} L ${cx - 21} ${cy - 12} Z`} fill="none" />
        <circle cx={cx - 10} cy={cy + 4} r="3" fill={dot} />
        <circle cx={cx + 10} cy={cy + 4} r="3" fill={dot} />
        <path d={`M ${cx - 22} ${cy - 12} l 8 5 M ${cx + 22} ${cy - 12} l -8 5`} stroke={LINE} strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx={cx - 14} cy={cy + 16} rx="1.8" ry="2.6" fill="#7cc4ff" />
      </g>
    )
  }
  const up = ex === 'excited' || ex === 'cheer' ? -1.6 : ex === 'thinking' ? -2.4 : 0
  const dx = ex === 'thinking' ? -3 : 0
  const r = (ex === 'excited' || ex === 'cheer' ? 5 : 4.5) * s
  return (
    <g>
      <path
        d={`M ${cx - 21} ${cy - 2} C ${cx - 20} ${cy - 13} ${cx - 12} ${cy - 17} ${cx - 5} ${cy - 13} C ${cx - 2} ${cy - 11} ${cx - 1} ${cy - 9} ${cx} ${cy - 8} C ${cx + 1} ${cy - 9} ${cx + 2} ${cy - 11} ${cx + 5} ${cy - 13} C ${cx + 12} ${cy - 17} ${cx + 20} ${cy - 13} ${cx + 21} ${cy - 2} C ${cx + 22} ${cy + 8} ${cx + 16} ${cy + 15} ${cx + 9} ${cy + 14} C ${cx + 4} ${cy + 13} ${cx + 1} ${cy + 9} ${cx} ${cy + 6} C ${cx - 1} ${cy + 9} ${cx - 4} ${cy + 13} ${cx - 9} ${cy + 14} C ${cx - 16} ${cy + 15} ${cx - 22} ${cy + 8} ${cx - 21} ${cy - 2} Z`}
        fill="#fff"
        stroke={LINE}
        strokeWidth="2"
      />
      {iris && (
        <g opacity="0.5">
          <circle cx={cx - 10 + dx} cy={cy + up} r={r + 1.6} fill={iris} />
          <circle cx={cx + 10 + dx} cy={cy + up} r={r + 1.6} fill={iris} />
        </g>
      )}
      <circle cx={cx - 10 + dx} cy={cy + up} r={r} fill={iris ?? '#fff'} stroke={LINE} strokeWidth="1.6" />
      <circle cx={cx + 10 + dx} cy={cy + up} r={r} fill={iris ?? '#fff'} stroke={LINE} strokeWidth="1.6" />
      <circle cx={cx - 10 + dx} cy={cy + up} r={r * 0.5} fill={dot} />
      <circle cx={cx + 10 + dx} cy={cy + up} r={r * 0.5} fill={dot} />
      <circle cx={cx - 10 + dx + 1.6} cy={cy + up - 1.8} r="1.3" fill="#fff" />
      <circle cx={cx + 10 + dx + 1.6} cy={cy + up - 1.8} r="1.3" fill="#fff" />
      {ex === 'excited' && (
        <path d={`M ${cx + 16} ${cy - 14} l 1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2 Z`} fill="#ffd23e" />
      )}
    </g>
  )
}

function Mouth({ x, y, ex }: { x: number; y: number; ex: Expression }) {
  if (ex === 'sad')
    return <path d={`M ${x - 8} ${y + 5} Q ${x} ${y - 3} ${x + 8} ${y + 5}`} stroke={LINE} strokeWidth="3.2" fill="none" strokeLinecap="round" />
  if (ex === 'thinking')
    return (
      <g>
        <path d={`M ${x - 7} ${y + 1} Q ${x - 2} ${y - 3} ${x + 2} ${y + 1}`} stroke={LINE} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx={x + 8} cy={y - 6} r="1.6" fill={LINE} opacity="0.6" />
      </g>
    )
  if (ex === 'excited' || ex === 'cheer')
    return (
      <g>
        <path d={`M ${x - 10} ${y - 1} Q ${x} ${y + 13} ${x + 10} ${y - 1} Q ${x} ${y + 3} ${x - 10} ${y - 1} Z`} fill="#96312c" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        <path d={`M ${x - 5} ${y + 5} Q ${x} ${y + 10} ${x + 5} ${y + 5} Z`} fill="#ff8fa3" />
      </g>
    )
  return <path d={`M ${x - 8} ${y - 2} Q ${x} ${y + 5} ${x + 8} ${y - 2}`} stroke={LINE} strokeWidth="3.2" fill="none" strokeLinecap="round" />
}

function Blush({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g opacity="0.45">
      <ellipse cx={x1} cy={y} rx="5.2" ry="3" fill="#ff8fab" />
      <ellipse cx={x2} cy={y} rx="5.2" ry="3" fill="#ff8fab" />
    </g>
  )
}

function Glove({ x, y, spikes, ring }: { x: number; y: number; spikes?: boolean; ring?: string }) {
  return (
    <g>
      {spikes && (
        <g fill="#fff" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round">
          <path d={`M ${x - 2} ${y - 5} l -4 -7 6 2 Z`} />
          <path d={`M ${x + 3} ${y - 6} l 1 -8 4 6 Z`} />
        </g>
      )}
      <circle cx={x} cy={y} r="6.4" fill="#fff" stroke={LINE} strokeWidth="2" />
      <path d={`M ${x - 2.4} ${y + 1.4} q 2.4 2 4.8 0`} stroke="#c9cfdd" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {ring && <circle cx={x} cy={y - 7.4} r="3.1" fill="none" stroke={ring} strokeWidth="2.6" />}
    </g>
  )
}

function Sneaker({ x, y = 109, color = '#e23636', cuff }: { x: number; y?: number; color?: string; cuff?: string }) {
  return (
    <g>
      {cuff && <rect x={x - 8} y={y - 9.5} width="16" height="5" rx="2.5" fill={cuff} stroke={LINE} strokeWidth="1.6" />}
      <ellipse cx={x} cy={y} rx="11" ry="6" fill={color} stroke={LINE} strokeWidth="2" />
      <rect x={x - 10.5} y={y + 2.2} width="21" height="4.2" rx="2.1" fill="#fff" stroke={LINE} strokeWidth="1.6" />
      <rect x={x - 8} y={y - 3.2} width="16" height="3.6" rx="1.8" fill="#fff" />
      <circle cx={x + 5.5} cy={y - 1.4} r="1.5" fill="#facc15" stroke={LINE} strokeWidth="0.8" />
    </g>
  )
}

/** Small chibi torso: body + belly + arms with gloves. Drawn BEFORE the head. */
function Torso({
  body,
  belly,
  gloveX = 33,
  gloveY = 95,
  gloveSpikes,
  gloveRing,
  flipGlove,
}: {
  body: string
  belly: string
  gloveX?: number
  gloveY?: number
  gloveSpikes?: boolean
  gloveRing?: string
  flipGlove?: boolean
}) {
  return (
    <g>
      <ellipse cx="60" cy="92" rx="15.5" ry="12" fill={body} stroke={LINE} strokeWidth="2" />
      <ellipse cx="60" cy="95" rx="9.2" ry="7.6" fill={belly} />
      <path d="M 48 86 C 41 88 36 91 34 94" stroke={body} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 72 86 C 79 88 84 91 86 94" stroke={body} strokeWidth="7" fill="none" strokeLinecap="round" />
      <Glove x={gloveX} y={gloveY} spikes={gloveSpikes} ring={gloveRing} />
      <Glove x={120 - gloveX} y={gloveY} spikes={gloveSpikes && !flipGlove} ring={gloveRing} />
    </g>
  )
}

function Legs({ body }: { body: string }) {
  return (
    <g>
      <path d="M 53 101 L 51 106" stroke={body} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 67 101 L 69 106" stroke={body} strokeWidth="7" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** Mirrored pair of back quills for hedgehogs. `paths` = right-side path d strings. */
function QuillPair({ paths, fill, shade }: { paths: string[]; fill: string; shade?: string }) {
  return (
    <g>
      {[...paths, ...paths].map((d, i) =>
        i < paths.length ? (
          <path key={i} d={d} fill={shade ?? fill} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        ) : (
          <path key={i} d={d} fill={fill} stroke={LINE} strokeWidth="2" strokeLinejoin="round" transform="translate(120 0) scale(-1 1)" />
        ),
      )}
    </g>
  )
}

/* ------------------------------- SONIC -------------------------------- */

export function Sonic({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="sonicShine">
      <GroundShadow />
      <QuillPair
        fill="#2b5ce6"
        shade="#2148bd"
        paths={[
          'M 87 36 C 100 25 113 22 116 27 C 114 37 103 45 90 47 Z',
          'M 90 53 C 106 50 116 55 115 60 C 111 67 100 69 91 65 Z',
          'M 86 70 C 99 75 107 83 105 88 C 99 91 88 85 82 79 Z',
        ]}
      />
      {/* ears */}
      <path d="M 41 27 L 34 6 L 56 19 Z" fill="#2b5ce6" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 79 27 L 86 6 L 64 19 Z" fill="#2b5ce6" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 42 23 L 38 11 L 50 18 Z" fill="#f6d7a5" />
      <path d="M 78 23 L 82 11 L 70 18 Z" fill="#f6d7a5" />
      <Legs body="#2b5ce6" />
      <Torso body="#2b5ce6" belly="#f6d7a5" />
      <Sneaker x={49} />
      <Sneaker x={71} />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="#2b5ce6" stroke={LINE} strokeWidth="2.4" />
      <path d="M 34 38 C 40 26 52 20 64 21 C 52 26 42 32 34 38 Z" fill="#5b8cf7" opacity="0.7" />
      <ellipse cx="60" cy="67" rx="19" ry="12.5" fill="#f6d7a5" />
      <ellipse cx="60" cy="74" rx="13" ry="5" fill="#eec489" opacity="0.5" />
      <HedgehogEyes ex={ex} iris="#2f9e44" cy={46} />
      <ellipse cx="60" cy="58.5" rx="4.6" ry="3.6" fill="#1f2430" />
      <circle cx="58.6" cy="57.4" r="1" fill="#fff" opacity="0.8" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={37} x2={83} y={63} />
    </Frame>
  )
}

/* ------------------------------- TAILS -------------------------------- */

function FoxTail({ flip, delay }: { flip?: boolean; delay: string }) {
  return (
    <g className="gpu origin-[60px_88px] animate-float-y" style={{ animationDelay: delay }}>
      <g transform={flip ? 'translate(120 0) scale(-1 1)' : undefined}>
        <path d="M 52 88 C 36 86 22 76 16 60 C 27 65 34 63 39 58 C 36 70 42 81 54 85 Z" fill="#f59e0b" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 16 60 C 21 55 28 53 33 55 C 29 60 24 64 16 60 Z" fill="#fff" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
      </g>
    </g>
  )
}

export function Tails({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="tailsShine">
      <GroundShadow />
      <FoxTail delay="0s" />
      <FoxTail flip delay="-1.2s" />
      {/* ears */}
      <path d="M 38 30 L 27 4 L 58 20 Z" fill="#f59e0b" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 82 30 L 93 4 L 62 20 Z" fill="#f59e0b" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 40 25 L 33 9 L 52 19 Z" fill="#fff" />
      <path d="M 80 25 L 87 9 L 68 19 Z" fill="#fff" />
      <Legs body="#f59e0b" />
      <Torso body="#f59e0b" belly="#fff7ea" />
      <Sneaker x={49} />
      <Sneaker x={71} />
      {/* head */}
      <circle cx="60" cy="50" r="31" fill="#ffa726" stroke={LINE} strokeWidth="2.4" />
      <path d="M 35 38 C 41 27 52 21 63 22 C 52 27 43 32 35 38 Z" fill="#ffc46b" opacity="0.8" />
      {/* bangs */}
      <path d="M 45 27 Q 43 36 48 40 Q 47 32 52 26 Z" fill="#f59e0b" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M 60 24 Q 57 34 61 39 Q 62 30 66 25 Z" fill="#f59e0b" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M 75 27 Q 77 36 72 40 Q 73 32 68 26 Z" fill="#f59e0b" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="60" cy="67" rx="17.5" ry="12" fill="#fff7ea" />
      {/* separate oval eyes */}
      {ex === 'sad' ? (
        <g>
          <ellipse cx="49" cy="49" rx="7.5" ry="8.5" fill="#fff" stroke={LINE} strokeWidth="2" />
          <ellipse cx="71" cy="49" rx="7.5" ry="8.5" fill="#fff" stroke={LINE} strokeWidth="2" />
          <path d="M 43 42 Q 49 38 55 43 M 65 43 Q 71 38 77 42" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle cx="49" cy="52" r="2.8" fill="#2563eb" />
          <circle cx="71" cy="52" r="2.8" fill="#2563eb" />
        </g>
      ) : (
        <g>
          <ellipse cx="49" cy="48" rx="8" ry="10" fill="#fff" stroke={LINE} strokeWidth="2" />
          <ellipse cx="71" cy="48" rx="8" ry="10" fill="#fff" stroke={LINE} strokeWidth="2" />
          <circle cx="49" cy={ex === 'thinking' ? 45 : 49} r="4" fill="#2563eb" />
          <circle cx="71" cy={ex === 'thinking' ? 45 : 49} r="4" fill="#2563eb" />
          <circle cx="49" cy={ex === 'thinking' ? 45 : 49} r="1.9" fill="#1e3a8a" />
          <circle cx="71" cy={ex === 'thinking' ? 45 : 49} r="1.9" fill="#1e3a8a" />
          <circle cx="50.6" cy="46.6" r="1.4" fill="#fff" />
          <circle cx="72.6" cy="46.6" r="1.4" fill="#fff" />
        </g>
      )}
      <ellipse cx="60" cy="60" rx="3.6" ry="3" fill="#1f2430" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={39} x2={81} y={63} />
    </Frame>
  )
}

/* ------------------------------ KNUCKLES ------------------------------ */

export function Knuckles({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="knuxShine">
      <GroundShadow />
      {/* dreadlocks */}
      <path d="M 33 42 C 20 47 13 59 16 74 C 21 69 26 67 30 65 C 26 74 28 84 35 89 C 37 78 38 64 40 52 Z" fill="#b3241d" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 87 42 C 100 47 107 59 104 74 C 99 69 94 67 90 65 C 94 74 92 84 85 89 C 83 78 82 64 80 52 Z" fill="#b3241d" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 34 44 C 25 50 20 60 21 70 C 26 64 30 61 34 59 Z" fill="#d93025" opacity="0.7" />
      <path d="M 86 44 C 95 50 100 60 99 70 C 94 64 90 61 86 59 Z" fill="#d93025" opacity="0.7" />
      <Legs body="#e0392f" />
      <Torso body="#e0392f" belly="#ffd9c9" gloveX={32} gloveY={96} gloveSpikes />
      <Sneaker x={49} color="#2f9e44" cuff="#facc15" />
      <Sneaker x={71} color="#2f9e44" cuff="#facc15" />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="#e0392f" stroke={LINE} strokeWidth="2.4" />
      <path d="M 34 38 C 40 26 52 20 64 21 C 52 26 42 32 34 38 Z" fill="#f2695f" opacity="0.8" />
      <ellipse cx="60" cy="67" rx="19" ry="12.5" fill="#ffd9c9" />
      {/* heavy brow */}
      <path d="M 40 38 Q 49 32 57 37 M 80 38 Q 71 32 63 37" stroke="#8c1a14" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <HedgehogEyes ex={ex} iris="#8b5cf6" cy={47} />
      <ellipse cx="60" cy="58.5" rx="4.4" ry="3.4" fill="#1f2430" />
      <Mouth x={60} y={70} ex={ex} />
      {/* chest crescent */}
      <path d="M 48 90 A 12.5 12.5 0 0 0 72 90 A 9.5 9.5 0 0 1 48 90 Z" fill="#fff" opacity="0.95" />
    </Frame>
  )
}

/* -------------------------------- AMY --------------------------------- */

export function Amy({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="amyShine">
      <GroundShadow />
      {/* side quills */}
      <path d="M 35 42 C 21 43 13 53 16 66 C 20 59 26 56 31 56 C 26 62 26 71 31 76 C 35 68 38 58 40 50 Z" fill="#ee64ae" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 85 42 C 99 43 107 53 104 66 C 100 59 94 56 89 56 C 94 62 94 71 89 76 C 85 68 82 58 80 50 Z" fill="#ee64ae" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <Legs body="#f472b6" />
      {/* dress */}
      <path d="M 48 80 L 72 80 L 79 102 Q 60 108 41 102 Z" fill="#e23636" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 44 99 Q 60 104 76 99" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="88" r="3" fill="#ffd23e" stroke={LINE} strokeWidth="1.4" />
      <path d="M 49 84 C 43 87 39 91 37 94" stroke="#f472b6" strokeWidth="6.5" fill="none" strokeLinecap="round" />
      <path d="M 71 84 C 77 87 81 91 83 94" stroke="#f472b6" strokeWidth="6.5" fill="none" strokeLinecap="round" />
      <Glove x={35} y={95} />
      <Glove x={85} y={95} />
      <Sneaker x={50} y={107} />
      <Sneaker x={70} y={107} />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="#f472b6" stroke={LINE} strokeWidth="2.4" />
      <path d="M 36 38 C 42 28 52 22 62 23 C 52 27 43 32 36 38 Z" fill="#f9a8d4" opacity="0.9" />
      <ellipse cx="60" cy="66" rx="17.5" ry="11.5" fill="#ffe4ee" />
      <HedgehogEyes ex={ex} iris="#2f9e44" cy={46} s={0.94} />
      {/* lashes */}
      <path d="M 37 38 l -4 -3 M 83 38 l 4 -3" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="60" cy="57.5" rx="4.2" ry="3.3" fill="#1f2430" />
      <Mouth x={60} y={69} ex={ex} />
      <Blush x1={39} x2={81} y={63} />
      {/* headband */}
      <path d="M 31 40 C 38 24 82 24 89 40" stroke="#e23636" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 31 40 C 38 24 82 24 89 40" stroke="#ff6b6b" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </Frame>
  )
}

/* ------------------------------- SHADOW ------------------------------- */

export function Shadow({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="shadowShine">
      <GroundShadow />
      <QuillPair
        fill="#262a36"
        shade="#1b1e28"
        paths={[
          'M 87 36 C 100 25 113 22 116 27 C 114 37 103 45 90 47 Z',
          'M 90 53 C 106 50 116 55 115 60 C 111 67 100 69 91 65 Z',
          'M 86 70 C 99 75 107 83 105 88 C 99 91 88 85 82 79 Z',
        ]}
      />
      {/* crimson streaks */}
      <g stroke="#e23636" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.95">
        <path d="M 92 34 C 102 27 111 24 115 26" />
        <path d="M 95 52 C 106 50 113 53 114 57" />
        <path d="M 91 70 C 101 74 107 80 106 85" />
        <path d="M 28 34 C 18 27 9 24 5 26" />
        <path d="M 25 52 C 14 50 7 53 6 57" />
        <path d="M 29 70 C 19 74 13 80 14 85" />
      </g>
      {/* ears */}
      <path d="M 41 27 L 34 6 L 56 19 Z" fill="#262a36" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 79 27 L 86 6 L 64 19 Z" fill="#262a36" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 42 23 L 38 11 L 50 18 Z" fill="#f6d7a5" />
      <path d="M 78 23 L 82 11 L 70 18 Z" fill="#f6d7a5" />
      <Legs body="#262a36" />
      <Torso body="#262a36" belly="#fff" gloveX={33} gloveY={95} gloveRing="#facc15" />
      <Sneaker x={49} color="#d81e1e" cuff="#facc15" />
      <Sneaker x={71} color="#d81e1e" cuff="#facc15" />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="#2c3040" stroke={LINE} strokeWidth="2.4" />
      <path d="M 34 38 C 40 26 52 20 64 21 C 52 26 42 32 34 38 Z" fill="#4a5064" opacity="0.8" />
      <ellipse cx="60" cy="67" rx="19" ry="12.5" fill="#f6d7a5" />
      {/* white fur tufts */}
      <path d="M 36 58 l -7 2 7 4 Z M 84 58 l 7 2 -7 4 Z" fill="#fff" opacity="0.95" />
      <HedgehogEyes ex={ex} iris="#ef4444" cy={46} />
      <ellipse cx="60" cy="58.5" rx="4.6" ry="3.6" fill="#1f2430" />
      <Mouth x={60} y={70} ex={ex} />
    </Frame>
  )
}

/* ------------------------------- SILVER ------------------------------- */

export function Silver({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  const frond = (t: string) => (
    <path
      d={t}
      fill="#dfe6f2"
      stroke={LINE}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  )
  return (
    <Frame shine="silverShine">
      <GroundShadow />
      {/* head fan of quills */}
      {frond('M 38 34 C 25 27 19 19 22 12 C 31 15 38 25 41 32 Z')}
      {frond('M 82 34 C 95 27 101 19 98 12 C 89 15 82 25 79 32 Z')}
      {frond('M 47 27 C 39 16 37 8 42 3 C 49 8 52 18 52 26 Z')}
      {frond('M 73 27 C 81 16 83 8 78 3 C 71 8 68 18 68 26 Z')}
      {frond('M 60 24 C 57 12 58 4 63 1 C 68 6 68 16 65 24 Z')}
      <g opacity="0.5" fill="#aab8d4">
        <path d="M 22 12 C 27 15 33 22 37 29 L 34 31 C 30 25 25 18 22 12 Z" />
        <path d="M 42 3 C 45 8 47 15 48 22 L 45 23 C 44 16 43 9 42 3 Z" />
      </g>
      <Legs body="#e8ecf5" />
      <Torso body="#e8ecf5" belly="#fff" gloveX={33} gloveY={95} gloveRing="#facc15" />
      <Sneaker x={49} color="#e8ecf5" cuff="#22d3ee" />
      <Sneaker x={71} color="#e8ecf5" cuff="#22d3ee" />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="#eef1f8" stroke={LINE} strokeWidth="2.4" />
      <path d="M 36 38 C 42 28 52 22 62 23 C 52 27 43 32 36 38 Z" fill="#fff" opacity="0.9" />
      <ellipse cx="60" cy="66" rx="17.5" ry="11.5" fill="#f6d7a5" />
      <HedgehogEyes ex={ex} iris="#eab308" cy={46} s={0.94} />
      <ellipse cx="60" cy="57.5" rx="4.2" ry="3.3" fill="#1f2430" />
      <Mouth x={60} y={69} ex={ex} />
      <Blush x1={40} x2={80} y={62} />
      {/* chest medallion */}
      <circle cx="60" cy="93" r="5.5" fill="none" stroke="#facc15" strokeWidth="3" />
    </Frame>
  )
}

/* ---------------------------- METAL SONIC ----------------------------- */

export function MetalSonic({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  const glow = ex === 'sad' ? '#b91c1c' : ex === 'thinking' ? '#ff8c3b' : '#ff3b3b'
  return (
    <Frame shine="metalShine">
      <defs>
        <linearGradient id="metalHead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b6ff0" />
          <stop offset="100%" stopColor="#1d3fa8" />
        </linearGradient>
        <linearGradient id="metalPlate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8eef7" />
          <stop offset="100%" stopColor="#aab8cf" />
        </linearGradient>
      </defs>
      <GroundShadow />
      {/* back quills - angular metal */}
      <QuillPair
        fill="#1d3fa8"
        shade="#16307f"
        paths={[
          'M 86 36 L 112 24 L 108 40 L 90 46 Z',
          'M 90 54 L 114 56 L 108 66 L 90 64 Z',
          'M 85 70 L 104 82 L 98 88 L 81 78 Z',
        ]}
      />
      {/* ear fins */}
      <path d="M 40 26 L 33 8 L 55 19 Z" fill="url(#metalPlate)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 80 26 L 87 8 L 65 19 Z" fill="url(#metalPlate)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <Legs body="#2b5ce6" />
      <Torso body="#2b5ce6" belly="url(#metalPlate)" gloveX={33} gloveY={95} />
      {/* jet turbine chest */}
      <circle cx="60" cy="94" r="7" fill="#10131f" stroke="#cfd8e6" strokeWidth="2.6" />
      <circle cx="60" cy="94" r="2.6" fill={glow}>
        <animate attributeName="opacity" values="1;0.55;1" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <Sneaker x={49} color="#2b5ce6" cuff="#e23636" />
      <Sneaker x={71} color="#2b5ce6" cuff="#e23636" />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="url(#metalHead)" stroke={LINE} strokeWidth="2.4" />
      {/* chrome crown plate */}
      <path d="M 31 40 C 35 22 85 22 89 40 C 79 29 41 29 31 40 Z" fill="url(#metalPlate)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="60" cy="68" rx="18" ry="12" fill="url(#metalPlate)" stroke={LINE} strokeWidth="2" />
      <g stroke="#7d8ba3" strokeWidth="1.6" strokeLinecap="round">
        <path d="M 52 74 h 5 M 60 75 h 5 M 68 74 h 3" />
      </g>
      {/* visor */}
      <path d="M 37 45 C 45 37 75 37 83 45 C 75 52 45 52 37 45 Z" fill="#10131f" stroke={LINE} strokeWidth="2" />
      {ex === 'sad' ? (
        <g>
          <path d="M 46 47 l 8 -3 M 74 47 l -8 -3" stroke={glow} strokeWidth="3.4" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <ellipse cx="50" cy="44.5" rx="4.6" ry={ex === 'excited' || ex === 'cheer' ? 3.4 : 2.8} fill={glow} />
          <ellipse cx="70" cy="44.5" rx="4.6" ry={ex === 'excited' || ex === 'cheer' ? 3.4 : 2.8} fill={glow} />
          <circle cx="51.4" cy="43.6" r="1.3" fill="#ffd7d7" />
          <circle cx="71.4" cy="43.6" r="1.3" fill="#ffd7d7" />
          <ellipse cx="50" cy="44.5" rx="7" ry="4.6" fill={glow} opacity="0.25" />
          <ellipse cx="70" cy="44.5" rx="7" ry="4.6" fill={glow} opacity="0.25" />
        </g>
      )}
      {/* metal nose + mouth vent */}
      <path d="M 56 60 L 64 60 L 60 65 Z" fill="#8d9cb5" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      {ex === 'excited' || ex === 'cheer' ? (
        <path d="M 52 71 Q 60 78 68 71 Z" fill="#10131f" stroke={LINE} strokeWidth="1.6" />
      ) : ex === 'sad' ? (
        <path d="M 53 74 Q 60 70 67 74" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 53 71 Q 60 74 67 71" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
    </Frame>
  )
}

/* ------------------------------- registry ----------------------------- */

export const MASCOTS: Record<string, (p: MascotProps) => JSX.Element> = {
  sonic: Sonic,
  tails: Tails,
  knuckles: Knuckles,
  amy: Amy,
  shadow: Shadow,
  silver: Silver,
  metal: MetalSonic,
}

export function Mascot({ id, ...rest }: MascotProps & { id: string }) {
  const C = MASCOTS[id] ?? Sonic
  return <C {...rest} />
}
