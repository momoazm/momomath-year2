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

/** Vertical body gradient def (light top -> dark bottom). */
function BodyGrad({ id, from, to, mid }: { id: string; from: string; to: string; mid?: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={from} />
        {mid && <stop offset="52%" stopColor={mid} />}
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  )
}

function GroundShadow() {
  return <ellipse cx="60" cy="115" rx="25" ry="3.6" fill="#0b1c3a" opacity="0.13" />
}

/** Curved rim-light on the upper-left of a round head. */
function HeadShine({ cx = 60, cy = 50, r = 32 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <path
      d={`M ${cx - r * 0.68} ${cy - r * 0.5} Q ${cx - r * 0.25} ${cy - r * 1.02} ${cx + r * 0.4} ${cy - r * 0.88}`}
      stroke="rgba(255,255,255,0.5)"
      strokeWidth={r * 0.14}
      fill="none"
      strokeLinecap="round"
    />
  )
}

/** Periodic blink: face-coloured lids flash over the eyes (pure SVG, no JS). */
function BlinkLids({ spots, rx, ry, fill, delay = '0s' }: { spots: [number, number][]; rx: number; ry: number; fill: string; delay?: string }) {
  return (
    <g>
      {spots.map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={fill} stroke={LINE} strokeWidth="1.6" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0;1;0;0"
              keyTimes="0;0.9;0.93;0.96;1"
              dur="5.6s"
              begin={delay}
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      ))}
    </g>
  )
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

/** Two separate oval eyes (Tails/Cream/Rouge/Blaze style). */
function OvalEyes({ ex, iris, cy = 48, lx = 49, rx = 71, glow }: { ex: Expression; iris: string; cy?: number; lx?: number; rx?: number; glow?: string }) {
  if (ex === 'sad') {
    return (
      <g>
        <ellipse cx={lx} cy={cy + 1} rx="7.5" ry="8.5" fill="#fff" stroke={LINE} strokeWidth="2" />
        <ellipse cx={rx} cy={cy + 1} rx="7.5" ry="8.5" fill="#fff" stroke={LINE} strokeWidth="2" />
        <path d={`M ${lx - 6} ${cy - 7} Q ${lx} ${cy - 11} ${lx + 6} ${cy - 6} M ${rx - 6} ${cy - 6} Q ${rx} ${cy - 11} ${rx + 6} ${cy - 7}`} stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx={lx} cy={cy + 4} r="2.8" fill={iris} />
        <circle cx={rx} cy={cy + 4} r="2.8" fill={iris} />
      </g>
    )
  }
  const cy2 = ex === 'thinking' ? cy - 4 : ex === 'excited' || ex === 'cheer' ? cy - 1 : cy
  return (
    <g>
      {glow && (
        <g opacity="0.3">
          <circle cx={lx} cy={cy2} r="6.4" fill={glow} />
          <circle cx={rx} cy={cy2} r="6.4" fill={glow} />
        </g>
      )}
      <ellipse cx={lx} cy={cy} rx="8" ry="10" fill="#fff" stroke={LINE} strokeWidth="2" />
      <ellipse cx={rx} cy={cy} rx="8" ry="10" fill="#fff" stroke={LINE} strokeWidth="2" />
      <circle cx={lx} cy={cy2} r="4" fill={iris} />
      <circle cx={rx} cy={cy2} r="4" fill={iris} />
      <circle cx={lx} cy={cy2} r="1.9" fill="#1f2430" />
      <circle cx={rx} cy={cy2} r="1.9" fill="#1f2430" />
      <circle cx={lx + 1.6} cy={cy2 - 2.2} r="1.4" fill="#fff" />
      <circle cx={rx + 1.6} cy={cy2 - 2.2} r="1.4" fill="#fff" />
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

function Glove({ x, y, spikes, ring, palm }: { x: number; y: number; spikes?: boolean; ring?: string; palm?: string }) {
  return (
    <g>
      {spikes && (
        <g fill="#fff" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round">
          <path d={`M ${x - 2} ${y - 5} l -4 -7 6 2 Z`} />
          <path d={`M ${x + 3} ${y - 6} l 1 -8 4 6 Z`} />
        </g>
      )}
      <circle cx={x} cy={y} r="6.4" fill="#fff" stroke={LINE} strokeWidth="2" />
      {palm && <circle cx={x} cy={y + 0.6} r="2.4" fill={palm} opacity="0.85" />}
      <path d={`M ${x - 2.4} ${y + 3.4} q 2.4 2 4.8 0`} stroke="#c9cfdd" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {ring && <circle cx={x} cy={y - 7.4} r="3.1" fill="none" stroke={ring} strokeWidth="2.6" />}
    </g>
  )
}

function Sneaker({ x, y = 109, color = '#e23636', cuff }: { x: number; y?: number; color?: string; cuff?: string }) {
  return (
    <g>
      {cuff && <rect x={x - 8} y={y - 9.5} width="16" height="5" rx="2.5" fill={cuff} stroke={LINE} strokeWidth="1.6" />}
      <ellipse cx={x} cy={y} rx="11" ry="6" fill={color} stroke={LINE} strokeWidth="2" />
      <path d={`M ${x - 9} ${y - 2} Q ${x} ${y - 6.5} ${x + 9} ${y - 2}`} stroke="rgba(255,255,255,0.55)" strokeWidth="2" fill="none" strokeLinecap="round" />
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
  glovePalm,
  flipGlove,
}: {
  body: string
  belly: string
  gloveX?: number
  gloveY?: number
  gloveSpikes?: boolean
  gloveRing?: string
  glovePalm?: string
  flipGlove?: boolean
}) {
  return (
    <g>
      <ellipse cx="60" cy="92" rx="15.5" ry="12" fill={body} stroke={LINE} strokeWidth="2" />
      <ellipse cx="60" cy="95" rx="9.2" ry="7.6" fill={belly} />
      <path d="M 48 86 C 41 88 36 91 34 94" stroke={body} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 72 86 C 79 88 84 91 86 94" stroke={body} strokeWidth="7" fill="none" strokeLinecap="round" />
      <Glove x={gloveX} y={gloveY} spikes={gloveSpikes} ring={gloveRing} palm={glovePalm} />
      <Glove x={120 - gloveX} y={gloveY} spikes={gloveSpikes && !flipGlove} ring={gloveRing} palm={glovePalm} />
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

/** Swept-back quills: right-side paths, auto-mirrored. Optional accent strokes (Shadow streaks). */
function SweptQuills({
  paths,
  fill,
  accents,
  sway = true,
  origin = '60px 46px',
}: {
  paths: string[]
  fill: string
  accents?: string[]
  sway?: boolean
  origin?: string
}) {
  const body = (
    <>
      {paths.map((d, i) => (
        <path key={i} d={d} fill={fill} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      ))}
      {accents?.map((d, i) => (
        <path key={`a${i}`} d={d} stroke="#e23636" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      ))}
    </>
  )
  return (
    <g className={sway ? `gpu origin-[${origin}] animate-quill-sway` : undefined}>
      <g>
        {body}
        <g transform="translate(120 0) scale(-1 1)">{body}</g>
      </g>
    </g>
  )
}

/* ------------------------------- SONIC -------------------------------- */

export function Sonic({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="sonicShine">
      <BodyGrad id="sncB" from="#5b8cf7" to="#1d43b1" mid="#2b5ce6" />
      <GroundShadow />
      <SweptQuills
        fill="url(#sncB)"
        paths={[
          'M 80 36 C 93 36 102 41 106 52 C 97 54 88 52 82 48 C 80 44 79 40 80 36 Z',
          'M 81 52 C 94 53 102 59 104 70 C 96 71 88 68 83 63 C 81 59 80 55 81 52 Z',
          'M 77 64 C 88 66 95 73 97 84 C 89 85 81 80 75 73 C 75 70 75 67 77 64 Z',
        ]}
      />
      {/* ears */}
      <path d="M 46 22 L 40 7 L 58 16 Z" fill="url(#sncB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 74 22 L 80 7 L 62 16 Z" fill="url(#sncB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 47 19 L 43.5 10 L 53 15.5 Z" fill="#f6d7a5" />
      <path d="M 73 19 L 76.5 10 L 67 15.5 Z" fill="#f6d7a5" />
      <Legs body="#2b5ce6" />
      <Torso body="url(#sncB)" belly="#f6d7a5" />
      <Sneaker x={49} />
      <Sneaker x={71} />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="url(#sncB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine />
      <ellipse cx="60" cy="67" rx="19" ry="12.5" fill="#f6d7a5" />
      <ellipse cx="60" cy="74" rx="13" ry="5" fill="#eec489" opacity="0.5" />
      <HedgehogEyes ex={ex} iris="#1f9e4b" cy={46} />
      <BlinkLids spots={[[49.5, 46], [70.5, 46]]} rx={11} ry={9} fill="#2b5ce6" />
      <ellipse cx="60" cy="58.5" rx="4.6" ry="3.6" fill="#1f2430" />
      <circle cx="58.6" cy="57.4" r="1" fill="#fff" opacity="0.8" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={37} x2={83} y={63} />
    </Frame>
  )
}

/* ------------------------------- TAILS -------------------------------- */

export function Tails({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="tailsShine">
      <BodyGrad id="tlsB" from="#ffc46b" to="#ef7d00" mid="#ff9d2e" />
      <GroundShadow />
      {/* twin tails, wagging */}
      <g>
        <g transform="translate(120 0) scale(-1 1)">
          <g>
            <animateTransform attributeName="transform" type="rotate" values="-6 66 84;6 66 84;-6 66 84" dur="1.9s" repeatCount="indefinite" />
            <path d="M 66 86 C 82 86 97 76 105 58 L 98 52 C 90 68 79 76 64 79 Z" fill="url(#tlsB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
            <path d="M 105 58 C 108 51 105 46 100 49 C 97 53 96 57 98 60 Z" fill="#fff" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-6 66 84;6 66 84;-6 66 84" dur="1.9s" begin="-0.95s" repeatCount="indefinite" />
          <path d="M 66 86 C 82 86 97 76 105 58 L 98 52 C 90 68 79 76 64 79 Z" fill="url(#tlsB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M 105 58 C 108 51 105 46 100 49 C 97 53 96 57 98 60 Z" fill="#fff" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
        </g>
      </g>
      {/* big ears */}
      <path d="M 41 28 L 32 10 L 58 20 Z" fill="url(#tlsB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 79 28 L 88 10 L 62 20 Z" fill="url(#tlsB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 43 24 L 37 13 L 52 20 Z" fill="#fff" />
      <path d="M 77 24 L 83 13 L 68 20 Z" fill="#fff" />
      <Legs body="#ff9d2e" />
      <Torso body="url(#tlsB)" belly="#fff7ea" />
      <Sneaker x={49} color="#e23636" cuff="#fff" />
      <Sneaker x={71} color="#e23636" cuff="#fff" />
      {/* head */}
      <circle cx="60" cy="50" r="31" fill="url(#tlsB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={31} />
      {/* bangs */}
      <path d="M 45 27 Q 43 36 48 40 Q 47 32 52 26 Z" fill="#ff9d2e" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M 60 24 Q 57 34 61 39 Q 62 30 66 25 Z" fill="#ff9d2e" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M 75 27 Q 77 36 72 40 Q 73 32 68 26 Z" fill="#ff9d2e" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="60" cy="67" rx="17.5" ry="12" fill="#fff7ea" />
      <OvalEyes ex={ex} iris="#2563eb" />
      <BlinkLids spots={[[49, 48], [71, 48]]} rx={9} ry={11} fill="#ff9d2e" delay="-2.1s" />
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
      <BodyGrad id="knxB" from="#f2695f" to="#a31f18" mid="#e0392f" />
      <GroundShadow />
      {/* dreadlocks swept down-back */}
      <SweptQuills
        fill="url(#knxB)"
        paths={[
          'M 79 36 C 92 36 101 42 104 52 C 96 54 88 52 82 48 C 79 44 78 40 79 36 Z',
          'M 80 52 C 93 53 101 59 103 70 C 95 71 88 68 82 62 C 80 58 79 54 80 52 Z',
          'M 76 63 C 87 65 94 72 96 83 C 88 84 80 79 74 72 C 74 69 74 66 76 63 Z',
        ]}
      />
      <Legs body="#e0392f" />
      <Torso body="url(#knxB)" belly="#ffd9c9" gloveX={32} gloveY={96} gloveSpikes />
      <Sneaker x={49} color="#2f9e44" cuff="#facc15" />
      <Sneaker x={71} color="#2f9e44" cuff="#facc15" />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="url(#knxB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine />
      <ellipse cx="60" cy="67" rx="19" ry="12.5" fill="#ffd9c9" />
      {/* heavy brow */}
      <path d="M 40 38 Q 49 32 57 37 M 80 38 Q 71 32 63 37" stroke="#8c1a14" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <HedgehogEyes ex={ex} iris="#8b5cf6" cy={47} />
      <BlinkLids spots={[[49.5, 47], [70.5, 47]]} rx={11} ry={9} fill="#e0392f" delay="-3.4s" />
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
      <BodyGrad id="amyB" from="#f9a8d4" to="#db2777" mid="#f472b6" />
      <GroundShadow />
      {/* side-swept bob */}
      <SweptQuills
        fill="url(#amyB)"
        paths={[
          'M 79 36 C 91 36 100 41 103 50 C 95 52 88 50 82 47 C 79 43 78 39 79 36 Z',
          'M 80 51 C 92 52 100 57 102 67 C 94 68 87 65 81 60 C 79 56 78 53 80 51 Z',
          'M 76 61 C 86 63 93 70 94 80 C 87 81 79 76 73 69 C 73 66 74 63 76 61 Z',
        ]}
      />
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
      <circle cx="60" cy="50" r="30" fill="url(#amyB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={30} />
      <ellipse cx="60" cy="66" rx="17.5" ry="11.5" fill="#ffe4ee" />
      <HedgehogEyes ex={ex} iris="#2f9e44" cy={46} s={0.94} />
      <BlinkLids spots={[[49.5, 46], [70.5, 46]]} rx={10.5} ry={8.5} fill="#f472b6" delay="-1.3s" />
      {/* lashes */}
      <path d="M 37 38 l -4 -3 M 83 38 l 4 -3" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="60" cy="57.5" rx="4.2" ry="3.3" fill="#1f2430" />
      <Mouth x={60} y={69} ex={ex} />
      <Blush x1={39} x2={81} y={63} />
      {/* headband */}
      <path d="M 33 42 C 40 27 80 27 87 42" stroke="#e23636" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 33 42 C 40 27 80 27 87 42" stroke="#ff6b6b" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </Frame>
  )
}

/* ------------------------------- SHADOW ------------------------------- */

export function Shadow({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="shadowShine">
      <BodyGrad id="shdB" from="#4a5064" to="#14161f" mid="#2c3040" />
      <GroundShadow />
      <SweptQuills
        fill="url(#shdB)"
        paths={[
          'M 80 36 C 93 36 102 41 106 52 C 97 54 88 52 82 48 C 80 44 79 40 80 36 Z',
          'M 81 52 C 94 53 102 59 104 70 C 96 71 88 68 83 63 C 81 59 80 55 81 52 Z',
          'M 77 64 C 88 66 95 73 97 84 C 89 85 81 80 75 73 C 75 70 75 67 77 64 Z',
        ]}
        accents={['M 86 40 C 94 41 100 45 103 50', 'M 87 56 C 95 57 100 61 102 66', 'M 82 67 C 90 69 94 74 96 81']}
      />
      {/* ears */}
      <path d="M 44 24 L 36 4 L 58 17 Z" fill="url(#shdB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 76 24 L 84 4 L 62 17 Z" fill="url(#shdB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 45.5 20 L 41 9 L 52 16 Z" fill="#f6d7a5" />
      <path d="M 74.5 20 L 79 9 L 68 16 Z" fill="#f6d7a5" />
      <Legs body="#2c3040" />
      <Torso body="url(#shdB)" belly="#fff" gloveX={33} gloveY={95} gloveRing="#facc15" />
      <Sneaker x={49} color="#d81e1e" cuff="#facc15" />
      <Sneaker x={71} color="#d81e1e" cuff="#facc15" />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="url(#shdB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine />
      <ellipse cx="60" cy="67" rx="19" ry="12.5" fill="#f6d7a5" />
      {/* white fur tufts */}
      <path d="M 36 58 l -7 2 7 4 Z M 84 58 l 7 2 -7 4 Z" fill="#fff" opacity="0.95" />
      <HedgehogEyes ex={ex} iris="#ef4444" cy={46} />
      <BlinkLids spots={[[49.5, 46], [70.5, 46]]} rx={11} ry={9} fill="#2c3040" delay="-4.2s" />
      <ellipse cx="60" cy="58.5" rx="4.6" ry="3.6" fill="#1f2430" />
      <Mouth x={60} y={70} ex={ex} />
    </Frame>
  )
}

/* ------------------------------- SILVER ------------------------------- */

export function Silver({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  const frond = (t: string) => (
    <path d={t} fill="url(#slvB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
  )
  return (
    <Frame shine="silverShine">
      <BodyGrad id="slvB" from="#ffffff" to="#c3cede" mid="#e8ecf5" />
      <GroundShadow />
      {/* head fan of quills */}
      <g className="gpu origin-[60px_40px] animate-quill-sway">
        {frond('M 38 34 C 25 27 19 19 22 12 C 31 15 38 25 41 32 Z')}
        {frond('M 82 34 C 95 27 101 19 98 12 C 89 15 82 25 79 32 Z')}
        {frond('M 47 27 C 39 16 37 8 42 3 C 49 8 52 18 52 26 Z')}
        {frond('M 73 27 C 81 16 83 8 78 3 C 71 8 68 18 68 26 Z')}
        {frond('M 60 24 C 57 12 58 4 63 1 C 68 6 68 16 65 24 Z')}
        <g opacity="0.5" fill="#aab8d4">
          <path d="M 22 12 C 27 15 33 22 37 29 L 34 31 C 30 25 25 18 22 12 Z" />
          <path d="M 42 3 C 45 8 47 15 48 22 L 45 23 C 44 16 43 9 42 3 Z" />
        </g>
      </g>
      <Legs body="#e8ecf5" />
      <Torso body="url(#slvB)" belly="#fff" gloveX={33} gloveY={95} gloveRing="#facc15" glovePalm="#22d3ee" />
      <Sneaker x={49} color="#e8ecf5" cuff="#22d3ee" />
      <Sneaker x={71} color="#e8ecf5" cuff="#22d3ee" />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="url(#slvB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={30} />
      <ellipse cx="60" cy="66" rx="17.5" ry="11.5" fill="#f6d7a5" />
      <HedgehogEyes ex={ex} iris="#eab308" cy={46} s={0.94} />
      <BlinkLids spots={[[49.5, 46], [70.5, 46]]} rx={10.5} ry={8.5} fill="#e8ecf5" delay="-2.8s" />
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
      <SweptQuills
        fill="#1d3fa8"
        sway={false}
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

/* ------------------------------- CREAM -------------------------------- */

export function Cream({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="creamShine">
      <BodyGrad id="crmB" from="#fff3dd" to="#e0c294" mid="#f8e7c9" />
      <GroundShadow />
      {/* long swaying ears */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-2.5 50 24;2.5 50 24;-2.5 50 24" dur="3.4s" repeatCount="indefinite" />
        <path d="M 46 26 C 41 12 43 4 50 2 C 56 4 57 12 55 26 Z" fill="url(#crmB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 48.5 22 C 46 12 47 6 50 4.5 C 53 6 53.5 12 52 22 Z" fill="#fb923c" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="2.5 70 24;-2.5 70 24;2.5 70 24" dur="3.4s" begin="-1.7s" repeatCount="indefinite" />
        <path d="M 74 26 C 79 12 77 4 70 2 C 64 4 63 12 65 26 Z" fill="url(#crmB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 71.5 22 C 74 12 73 6 70 4.5 C 67 6 66.5 12 68 22 Z" fill="#fb923c" />
      </g>
      <Legs body="#f8e7c9" />
      <Torso body="url(#crmB)" belly="#fff7ea" />
      {/* dress */}
      <path d="M 47 80 L 73 80 L 79 103 Q 60 109 41 103 Z" fill="#fb923c" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 48 83 Q 60 88 72 83" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="90" r="2.4" fill="#e23636" stroke={LINE} strokeWidth="1.2" />
      <Sneaker x={50} y={107} color="#e23636" cuff="#facc15" />
      <Sneaker x={70} y={107} color="#e23636" cuff="#facc15" />
      {/* head */}
      <circle cx="60" cy="50" r="29" fill="url(#crmB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={29} />
      <ellipse cx="60" cy="66" rx="16" ry="11" fill="#fff7ea" />
      <OvalEyes ex={ex} iris="#b45309" cy={47} lx={50} rx={70} />
      <BlinkLids spots={[[50, 47], [70, 47]]} rx={9} ry={11} fill="#f8e7c9" delay="-3.7s" />
      <ellipse cx="60" cy="59" rx="3" ry="2.4" fill="#1f2430" />
      <Mouth x={60} y={69} ex={ex} />
      <Blush x1={41} x2={79} y={62} />
    </Frame>
  )
}

/* ------------------------------- BLAZE -------------------------------- */

export function Blaze({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="blazeShine">
      <BodyGrad id="blzB" from="#a78bfa" to="#5b21b6" mid="#8b5cf6" />
      <GroundShadow />
      {/* tail with flame tip */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-5 68 86;5 68 86;-5 68 86" dur="2.2s" repeatCount="indefinite" />
        <path d="M 68 88 C 82 86 93 76 97 62 C 99 56 95 52 91 56 C 87 68 79 77 65 81 Z" fill="url(#blzB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 97 62 C 101 56 100 49 95 50 C 92 53 91 58 93 62 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" strokeLinejoin="round" />
      </g>
      {/* swept-back ponytail quill */}
      <SweptQuills
        fill="url(#blzB)"
        paths={['M 74 24 C 96 14 114 22 114 38 C 106 50 90 52 78 46 Z']}
      />
      {/* cat ears */}
      <path d="M 44 24 L 38 8 L 56 18 Z" fill="url(#blzB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 76 24 L 82 8 L 64 18 Z" fill="url(#blzB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 46 20 L 42.5 11 L 52 17 Z" fill="#f3e8ff" />
      <path d="M 74 20 L 77.5 11 L 68 17 Z" fill="#f3e8ff" />
      <Legs body="#8b5cf6" />
      <Torso body="url(#blzB)" belly="#f3e8ff" />
      {/* chest gem */}
      <circle cx="60" cy="90" r="4.6" fill="#e11d48" stroke="#facc15" strokeWidth="2" />
      <Sneaker x={49} color="#7c3aed" cuff="#fff" />
      <Sneaker x={71} color="#7c3aed" cuff="#fff" />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="url(#blzB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={30} />
      <ellipse cx="60" cy="66" rx="17" ry="11.5" fill="#f3e8ff" />
      {/* forehead flame */}
      <g className="gpu origin-[60px_16px] animate-flame-flicker">
        <path d="M 60 2 C 67 9 69 16 64 21 C 62 23.5 58 23.5 56 21 C 51 16 53 9 60 2 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M 60 9 C 63.5 12.5 64 17 61.5 19.5 C 60 21 58 20.5 57.5 18.5 C 56.5 15.5 57.5 12 60 9 Z" fill="#fef3c7" />
      </g>
      <OvalEyes ex={ex} iris="#d97706" />
      {/* pink lids */}
      <path d="M 41 41 Q 49 35 57 41 M 63 41 Q 71 35 79 41" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinecap="round" />
      <BlinkLids spots={[[49, 48], [71, 48]]} rx={9} ry={11} fill="#8b5cf6" delay="-1.9s" />
      <ellipse cx="60" cy="60" rx="3.4" ry="2.8" fill="#1f2430" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={40} x2={80} y={62} />
    </Frame>
  )
}

/* ------------------------------- ROUGE -------------------------------- */

export function Rouge({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="rougeShine">
      <BodyGrad id="rgH" from="#ffffff" to="#d7deea" mid="#f4f7fb" />
      <BodyGrad id="rgW" from="#3a3247" to="#1c1826" mid="#2d2438" />
      <GroundShadow />
      {/* flapping wings */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-4 74 82;3 74 82;-4 74 82" dur="2.4s" repeatCount="indefinite" />
        <path d="M 72 82 C 88 76 102 62 108 44 C 102 50 97 50 99 42 C 92 48 88 47 90 39 C 83 46 78 54 76 62 Z" fill="url(#rgW)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <g transform="translate(120 0) scale(-1 1)">
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-4 74 82;3 74 82;-4 74 82" dur="2.4s" begin="-1.2s" repeatCount="indefinite" />
          <path d="M 72 82 C 88 76 102 62 108 44 C 102 50 97 50 99 42 C 92 48 88 47 90 39 C 83 46 78 54 76 62 Z" fill="url(#rgW)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
        </g>
      </g>
      {/* ears */}
      <path d="M 46 26 L 42 12 L 56 20 Z" fill="#2d2438" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 74 26 L 78 12 L 64 20 Z" fill="#2d2438" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 47.5 22 L 45.5 15.5 L 52 19.5 Z" fill="#f472b6" />
      <path d="M 72.5 22 L 74.5 15.5 L 68 19.5 Z" fill="#f472b6" />
      <Legs body="#3a3247" />
      <Torso body="url(#rgW)" belly="#fff" />
      {/* heart gem */}
      <path d="M 60 93 C 56 89 52 87 52 83.5 C 52 80.5 55 79.5 57 81.5 L 60 84.5 L 63 81.5 C 65 79.5 68 80.5 68 83.5 C 68 87 64 89 60 93 Z" fill="#ff6b9d" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <Sneaker x={49} color="#ec4899" cuff="#fff" />
      <Sneaker x={71} color="#ec4899" cuff="#fff" />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="url(#rgH)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={30} />
      <ellipse cx="60" cy="66" rx="17" ry="11.5" fill="#fff" />
      <ellipse cx="60" cy="71" rx="12" ry="4.5" fill="#e2e8f0" opacity="0.7" />
      <OvalEyes ex={ex} iris="#14b8a6" />
      {/* pink eyelids */}
      <path d="M 41.5 41 Q 49 35.5 56.5 41 M 63.5 41 Q 71 35.5 78.5 41" stroke="#f472b6" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <BlinkLids spots={[[49, 48], [71, 48]]} rx={9} ry={11} fill="#f4f7fb" delay="-0.8s" />
      <ellipse cx="60" cy="60" rx="3.4" ry="2.8" fill="#1f2430" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={40} x2={80} y={62} />
    </Frame>
  )
}

/* ------------------------------- EGGMAN ------------------------------- */

export function Eggman({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="eggShine">
      <BodyGrad id="eggB" from="#f2695f" to="#a31f18" mid="#e0392f" />
      <GroundShadow />
      {/* pants + boots */}
      <path d="M 54 100 L 52 107 M 66 100 L 68 107" stroke="#1f2430" strokeWidth="8" fill="none" strokeLinecap="round" />
      <Sneaker x={50} y={110} color="#242938" cuff="#9aa5b1" />
      <Sneaker x={70} y={110} color="#242938" cuff="#9aa5b1" />
      {/* big round jacket */}
      <ellipse cx="60" cy="90" rx="19" ry="14" fill="url(#eggB)" stroke={LINE} strokeWidth="2.2" />
      <path d="M 60 77 L 60 103" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="85" r="2.2" fill="#facc15" stroke={LINE} strokeWidth="1" />
      <circle cx="60" cy="94" r="2.2" fill="#facc15" stroke={LINE} strokeWidth="1" />
      <path d="M 44 84 C 39 87 36 90 34 93" stroke="#e0392f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 76 84 C 81 87 84 90 86 93" stroke="#e0392f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Glove x={33} y={95} />
      <Glove x={87} y={95} />
      {/* head */}
      <circle cx="60" cy="44" r="30" fill="#ffd9b3" stroke={LINE} strokeWidth="2.4" />
      <HeadShine cy={44} r={30} />
      {/* goggles on forehead */}
      <path d="M 33 32 C 43 20 77 20 87 32" stroke="#334155" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="47" cy="26" r="5" fill="#9aa5b1" stroke="#334155" strokeWidth="2" />
      <circle cx="73" cy="26" r="5" fill="#9aa5b1" stroke="#334155" strokeWidth="2" />
      <circle cx="48.5" cy="24.5" r="1.4" fill="#e2e8f0" />
      <circle cx="74.5" cy="24.5" r="1.4" fill="#e2e8f0" />
      {/* pince-nez glasses + eyes */}
      {ex === 'thinking' ? (
        <g>
          <circle cx="48" cy="46" r="9.5" fill="#bfe3ff" stroke="#1e3a8a" strokeWidth="3" />
          <circle cx="72" cy="46" r="9.5" fill="#bfe3ff" stroke="#1e3a8a" strokeWidth="3" />
          <path d="M 39.5 42 A 9.5 9.5 0 0 1 56.5 42 L 56.5 46 L 39.5 46 Z" fill="#ffd9b3" opacity="0.85" />
          <path d="M 63.5 42 A 9.5 9.5 0 0 1 80.5 42 L 80.5 46 L 63.5 46 Z" fill="#ffd9b3" opacity="0.85" />
          <circle cx="48" cy="49" r="2.4" fill="#1f2430" />
          <circle cx="72" cy="49" r="2.4" fill="#1f2430" />
        </g>
      ) : (
        <g>
          <circle cx="48" cy="46" r="9.5" fill="#bfe3ff" stroke="#1e3a8a" strokeWidth="3" />
          <circle cx="72" cy="46" r="9.5" fill="#bfe3ff" stroke="#1e3a8a" strokeWidth="3" />
          <circle cx="48" cy={ex === 'sad' ? 48 : 46} r="2.6" fill="#1f2430" />
          <circle cx="72" cy={ex === 'sad' ? 48 : 46} r="2.6" fill="#1f2430" />
          <circle cx="49.4" cy="44.4" r="1.2" fill="#fff" />
          <circle cx="73.4" cy="44.4" r="1.2" fill="#fff" />
        </g>
      )}
      <path d="M 57.5 46 L 62.5 46" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
      {ex === 'sad' ? (
        <path d="M 40 36 L 45 39 M 80 36 L 75 39" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
      ) : ex === 'excited' || ex === 'cheer' ? (
        <path d="M 40 35 Q 44 32 48 34 M 80 35 Q 76 32 72 34" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      ) : null}
      {/* nose */}
      <ellipse cx="60" cy="56" rx="4" ry="3.4" fill="#f4b183" />
      {/* moustache */}
      <path d="M 57 60 C 48 56 38 58 33 66 C 40 71 50 69 57 65 Z" fill="#8a4b22" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 63 60 C 72 56 82 58 87 66 C 80 71 70 69 63 65 Z" fill="#8a4b22" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      {/* mouth */}
      {ex === 'excited' || ex === 'cheer' ? (
        <g>
          <path d="M 50 71 Q 60 80 70 71 Q 60 74 50 71 Z" fill="#96312c" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M 53 72.2 L 67 72.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ) : ex === 'sad' ? (
        <path d="M 53 75 Q 60 70.5 67 75" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : ex === 'thinking' ? (
        <path d="M 54 73 L 66 73" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 52 72 Q 60 77.5 68 72" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
    </Frame>
  )
}

/* ------------------------------ JET HAWK ------------------------------ */
/* Real Jet the Hawk character (not a tint): green hawk, yellow beak, red
 * forehead goggles, swept crest feathers. House chibi style like the rest. */

export function JetHawk({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  const open = ex === 'excited' || ex === 'cheer'
  const sad = ex === 'sad'
  const dx = ex === 'thinking' ? -2.5 : open ? 1.5 : 0
  const dy = open ? -1.5 : 0
  return (
    <Frame shine="jetShine">
      <BodyGrad id="jetB" from="#8ee69b" to="#1d7a34" mid="#3fae56" />
      <GroundShadow />
      {/* swept-back crest feathers */}
      <SweptQuills
        fill="url(#jetB)"
        paths={[
          'M 79 34 C 92 33 101 38 105 48 C 97 50 88 48 82 44 C 80 40 79 37 79 34 Z',
          'M 80 50 C 93 51 101 57 103 68 C 95 69 88 66 82 61 C 80 57 79 53 80 50 Z',
          'M 76 62 C 87 64 94 71 96 82 C 88 83 80 78 74 71 C 74 68 74 65 76 62 Z',
        ]}
      />
      {/* pointed ear tufts */}
      <path d="M 44 26 L 35 6 L 59 19 Z" fill="url(#jetB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 76 26 L 85 6 L 61 19 Z" fill="url(#jetB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 45.5 21.5 L 40.5 11 L 53 18 Z" fill="#fff7ea" />
      <path d="M 74.5 21.5 L 79.5 11 L 67 18 Z" fill="#fff7ea" />
      <Legs body="#3fae56" />
      <Torso body="url(#jetB)" belly="#fff7ea" />
      {/* chest feather marking */}
      <path d="M 60 86 l -4 7 4 -2 4 2 Z" fill="#fff7ea" stroke={LINE} strokeWidth="1.2" strokeLinejoin="round" />
      <Sneaker x={49} color="#d81e1e" cuff="#fff" />
      <Sneaker x={71} color="#d81e1e" cuff="#fff" />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="url(#jetB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={30} />
      {/* cheek feather tufts */}
      <path d="M 33 56 l -8 1 7 5 Z M 87 56 l 8 1 -7 5 Z" fill="#fff7ea" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      {/* red forehead goggles */}
      <path d="M 32 30 C 44 24 76 24 88 30" stroke="#7f1d1d" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="39" y="25" width="19" height="13" rx="6" fill="#d81e1e" stroke={LINE} strokeWidth="2" />
      <rect x="62" y="25" width="19" height="13" rx="6" fill="#d81e1e" stroke={LINE} strokeWidth="2" />
      <rect x="57" y="29" width="6" height="5" fill="#7f1d1d" />
      <circle cx="45" cy="29" r="2" fill="#fff" opacity="0.7" />
      <circle cx="68" cy="29" r="2" fill="#fff" opacity="0.7" />
      {/* fierce hawk eyes */}
      <ellipse cx={49} cy={47 + dy} rx="7.5" ry="9" fill="#fff" stroke={LINE} strokeWidth="2" />
      <ellipse cx={71} cy={47 + dy} rx="7.5" ry="9" fill="#fff" stroke={LINE} strokeWidth="2" />
      <circle cx={49 + dx} cy={49 + dy} r="3.4" fill="#1f2430" />
      <circle cx={71 + dx} cy={49 + dy} r="3.4" fill="#1f2430" />
      <circle cx={49 + dx + 1.2} cy={49 + dy - 1.4} r="1.2" fill="#fff" />
      <circle cx={71 + dx + 1.2} cy={49 + dy - 1.4} r="1.2" fill="#fff" />
      {/* angled attitude brows */}
      {sad ? (
        <path d="M 40 40 L 56 44 M 80 40 L 64 44" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M 40 44 L 56 40 M 80 44 L 64 40" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      )}
      <BlinkLids spots={[[49, 47], [71, 47]]} rx={8.5} ry={10} fill="#3fae56" delay="-2.5s" />
      {/* yellow beak */}
      <path d="M 47 59 Q 60 53 73 59 L 66 68 Q 60 71 54 68 Z" fill="#fbbf24" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      {open ? (
        <g>
          <path d="M 54 68 Q 60 78 66 68 Q 60 71 54 68 Z" fill="#96312c" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 56.5 70.5 Q 60 74 63.5 70.5 Z" fill="#ff8fa3" />
        </g>
      ) : sad ? (
        <path d="M 54 70 Q 60 67 66 70" stroke={LINE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 52 66 Q 60 69.5 68 66" stroke={LINE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}
      <Blush x1={39} x2={81} y={63} />
    </Frame>
  )
}

/* ------------------------------- registry ----------------------------- */

/* ------------------------------ CHARMY BEE ------------------------------ */

export function CharmyBee({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="charmyShine">
      <BodyGrad id="chaB" from="#ffd23e" to="#d98200" mid="#ffb020" />
      <GroundShadow />
      {/* stripy tail */}
      <path d="M 84 88 C 96 86 104 78 106 66 L 98 62 C 94 72 88 78 80 81 Z" fill="url(#chaB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 93 83 L 99 77 M 98 74 L 103 66" stroke="#1f2430" strokeWidth="3" strokeLinecap="round" />
      {/* wings */}
      <ellipse cx="38" cy="66" rx="9" ry="14" fill="#fff" opacity="0.65" stroke={LINE} strokeWidth="1.6" transform="rotate(-24 38 66)" />
      <ellipse cx="82" cy="66" rx="9" ry="14" fill="#fff" opacity="0.65" stroke={LINE} strokeWidth="1.6" transform="rotate(24 82 66)" />
      {/* antennae */}
      <path d="M 50 22 C 46 14 42 10 36 8 M 70 22 C 74 14 78 10 84 8" stroke="#1f2430" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="35" cy="8" r="3" fill="#1f2430" />
      <circle cx="85" cy="8" r="3" fill="#1f2430" />
      <Legs body="#ffb020" />
      <Torso body="url(#chaB)" belly="#fff7ea" />
      <Sneaker x={49} color="#d81e1e" cuff="#fff" />
      <Sneaker x={71} color="#d81e1e" cuff="#fff" />
      {/* head */}
      <circle cx="60" cy="50" r="29" fill="url(#chaB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={29} />
      {/* flight helmet */}
      <path d="M 33 44 C 37 24 83 24 87 44 L 84 44 C 80 30 40 30 36 44 Z" fill="#d81e1e" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 56 26 L 64 26 L 63 44 L 57 44 Z" fill="#fff" opacity="0.9" />
      <path d="M 33 44 C 50 40 70 40 87 44" stroke="#1d4ed8" strokeWidth="4" fill="none" strokeLinecap="round" />
      <OvalEyes ex={ex} iris="#1d4ed8" cy={50} />
      <BlinkLids spots={[[49, 50], [71, 50]]} rx={9} ry={11} fill="#ffb020" delay="-1.1s" />
      <ellipse cx="60" cy="61" rx="3" ry="2.4" fill="#1f2430" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={41} x2={79} y={64} />
    </Frame>
  )
}

/* ------------------------------- BIG CAT ------------------------------ */

export function BigCat({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="bigShine">
      <BodyGrad id="bigB" from="#b79df0" to="#5b3f9e" mid="#8f6fd8" />
      <GroundShadow />
      {/* long ears */}
      <path d="M 44 28 C 38 14 38 6 44 2 C 50 4 52 14 52 28 Z" fill="url(#bigB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 76 28 C 82 14 82 6 76 2 C 70 4 68 14 68 28 Z" fill="url(#bigB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 45 24 C 42 14 42 8 45 5 C 48 7 49 15 49 24 Z" fill="#f3e8ff" />
      <path d="M 75 24 C 78 14 78 8 75 5 C 72 7 71 15 71 24 Z" fill="#f3e8ff" />
      <Legs body="#8f6fd8" />
      <Torso body="url(#bigB)" belly="#f3e8ff" />
      {/* belt with gold buckle */}
      <rect x="44" y="86" width="32" height="7" rx="3.5" fill="#7a5230" stroke={LINE} strokeWidth="1.6" />
      <rect x="56" y="85" width="8" height="9" rx="2" fill="none" stroke="#facc15" strokeWidth="2.4" />
      <Sneaker x={49} color="#7a5230" />
      <Sneaker x={71} color="#7a5230" />
      {/* head */}
      <circle cx="60" cy="52" r="30" fill="url(#bigB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine cy={52} r={30} />
      <ellipse cx="60" cy="68" rx="17" ry="11.5" fill="#f3e8ff" />
      <OvalEyes ex={ex} iris="#2f9e44" cy={49} />
      <BlinkLids spots={[[49, 49], [71, 49]]} rx={9} ry={11} fill="#8f6fd8" delay="-3.1s" />
      <ellipse cx="60" cy="61" rx="4.4" ry="3.6" fill="#e88ca0" />
      <path d="M 34 63 l -9 -2 M 34 67 l -9 1 M 86 63 l 9 -2 M 86 67 l 9 1" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" />
      <Mouth x={60} y={72} ex={ex} />
      <Blush x1={39} x2={81} y={64} />
    </Frame>
  )
}

/* ---------------------------- RAY SQUIRREL ---------------------------- */

export function RaySquirrel({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="rayShine">
      <BodyGrad id="rayB" from="#ffdf6b" to="#d98200" mid="#ffc93e" />
      <GroundShadow />
      {/* glide membranes */}
      <path d="M 42 82 C 30 86 23 93 21 101 C 30 101 38 96 43 90 Z" fill="#e8c07a" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 78 82 C 90 86 97 93 99 101 C 90 101 82 96 77 90 Z" fill="#e8c07a" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      {/* big round ears */}
      <circle cx="38" cy="26" r="10" fill="url(#rayB)" stroke={LINE} strokeWidth="2" />
      <circle cx="82" cy="26" r="10" fill="url(#rayB)" stroke={LINE} strokeWidth="2" />
      <circle cx="38" cy="26" r="5" fill="#fff7ea" />
      <circle cx="82" cy="26" r="5" fill="#fff7ea" />
      <Legs body="#ffc93e" />
      <Torso body="url(#rayB)" belly="#fff7ea" />
      <Sneaker x={49} color="#7a5230" cuff="#fff" />
      <Sneaker x={71} color="#7a5230" cuff="#fff" />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="url(#rayB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={30} />
      <ellipse cx="60" cy="67" rx="16.5" ry="11" fill="#fff7ea" />
      <OvalEyes ex={ex} iris="#2563eb" />
      <BlinkLids spots={[[49, 48], [71, 48]]} rx={9} ry={11} fill="#ffc93e" delay="-0.6s" />
      <ellipse cx="60" cy="60" rx="3.4" ry="2.8" fill="#5b3a1a" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={40} x2={80} y={63} />
    </Frame>
  )
}

/* --------------------------- VECTOR CROC ------------------------------ */

export function VectorCroc({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  const up = ex === 'excited' || ex === 'cheer' ? -1.5 : 0
  return (
    <Frame shine="vectorShine">
      <BodyGrad id="vecB" from="#57b877" to="#1f6b3a" mid="#35995c" />
      <GroundShadow />
      <Legs body="#35995c" />
      <Torso body="url(#vecB)" belly="#fff7ea" gloveX={32} gloveY={96} gloveSpikes />
      <Sneaker x={49} color="#242938" cuff="#d81e1e" />
      <Sneaker x={71} color="#242938" cuff="#d81e1e" />
      {/* head */}
      <circle cx="60" cy="48" r="30" fill="url(#vecB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine cy={48} r={30} />
      {/* headphones */}
      <path d="M 32 40 C 40 22 80 22 88 40" stroke="#1f2430" strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="26" y="38" width="13" height="19" rx="6" fill="#1f2430" stroke={LINE} strokeWidth="2" />
      <rect x="81" y="38" width="13" height="19" rx="6" fill="#1f2430" stroke={LINE} strokeWidth="2" />
      <circle cx="32.5" cy="47.5" r="3" fill="#d81e1e" />
      <circle cx="87.5" cy="47.5" r="3" fill="#d81e1e" />
      {/* fierce yellow eyes */}
      <ellipse cx={49} cy={44 + up} rx="7.5" ry="8.5" fill="#fde047" stroke={LINE} strokeWidth="2" />
      <ellipse cx={71} cy={44 + up} rx="7.5" ry="8.5" fill="#fde047" stroke={LINE} strokeWidth="2" />
      <circle cx={49} cy={46 + up} r="3" fill="#1f2430" />
      <circle cx={71} cy={46 + up} r="3" fill="#1f2430" />
      <path d="M 40 35 L 56 38 M 80 35 L 64 38" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      {/* long snout with teeth */}
      <rect x="38" y="56" width="44" height="22" rx="11" fill="#fff7ea" stroke={LINE} strokeWidth="2" />
      <path d="M 46 56 l 4 7 4 -7 Z M 58 56 l 4 7 4 -7 Z M 70 56 l 4 7 4 -7 Z" fill="#fff" stroke={LINE} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="48" cy="70" r="1.6" fill="#1f2430" />
      <circle cx="72" cy="70" r="1.6" fill="#1f2430" />
      {ex === 'excited' || ex === 'cheer' ? (
        <path d="M 52 74 Q 60 80 68 74" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : null}
    </Frame>
  )
}

/* ---------------------------- ESPIO CHAM ------------------------------ */

export function EspioCham({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="espioShine">
      <BodyGrad id="espB" from="#d68ae0" to="#7a2f8f" mid="#b45fc6" />
      <GroundShadow />
      {/* curled tail */}
      <path d="M 86 92 c 13 1 16 -12 7 -15 c -7 -2 -12 5 -7 10" stroke="#b45fc6" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* head crest spikes */}
      <path d="M 48 26 L 44 12 L 56 22 Z M 60 24 L 60 8 L 68 22 Z M 72 26 L 76 12 L 64 22 Z" fill="url(#espB)" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
      <Legs body="#b45fc6" />
      <Torso body="url(#espB)" belly="#f3e8ff" />
      <Sneaker x={49} color="#0f766e" cuff="#fff" />
      <Sneaker x={71} color="#0f766e" cuff="#fff" />
      {/* head */}
      <circle cx="60" cy="50" r="29" fill="url(#espB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine r={29} />
      {/* nose horn */}
      <path d="M 60 42 L 54 26 L 66 26 Z" fill="#fff7ea" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="60" cy="66" rx="16" ry="11" fill="#f3e8ff" />
      <OvalEyes ex={ex} iris="#b45309" cy={47} />
      <BlinkLids spots={[[49, 47], [71, 47]]} rx={9} ry={11} fill="#b45fc6" delay="-1.7s" />
      <ellipse cx="60" cy="59" rx="3.2" ry="2.6" fill="#1f2430" />
      <Mouth x={60} y={69} ex={ex} />
      <Blush x1={41} x2={79} y={62} />
    </Frame>
  )
}

/* ------------------------------ OMEGA BOT ----------------------------- */

export function OmegaBot({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  const glow = ex === 'sad' ? '#7f1d1d' : '#ff3b3b'
  return (
    <Frame shine="omegaShine">
      <defs>
        <linearGradient id="omH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c3ccd8" />
          <stop offset="100%" stopColor="#5b6472" />
        </linearGradient>
      </defs>
      <GroundShadow />
      {/* bulky shoulder plates */}
      <SweptQuills
        fill="#6b7280"
        sway={false}
        paths={[
          'M 84 62 L 110 52 L 106 68 L 88 72 Z',
          'M 88 78 L 108 84 L 102 94 L 86 88 Z',
        ]}
      />
      {/* arms + claws */}
      <path d="M 43 84 L 32 96 M 77 84 L 88 96" stroke="#6b7280" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="31" cy="98" r="6" fill="#374151" stroke={LINE} strokeWidth="2" />
      <circle cx="89" cy="98" r="6" fill="#374151" stroke={LINE} strokeWidth="2" />
      {/* heavy legs + feet */}
      <path d="M 53 102 L 51 109 M 67 102 L 69 109" stroke="#4b5563" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="40" y="107" width="21" height="7" rx="3" fill="#1f2937" stroke={LINE} strokeWidth="1.8" />
      <rect x="59" y="107" width="21" height="7" rx="3" fill="#1f2937" stroke={LINE} strokeWidth="1.8" />
      {/* torso block */}
      <rect x="43" y="78" width="34" height="26" rx="8" fill="#9aa5b1" stroke={LINE} strokeWidth="2.2" />
      <circle cx="60" cy="90" r="5" fill="#facc15" stroke={LINE} strokeWidth="2">
        <animate attributeName="opacity" values="1;0.55;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <rect x="48" y="98" width="7" height="4" fill="#facc15" />
      <rect x="57" y="98" width="7" height="4" fill="#1f2430" />
      <rect x="66" y="98" width="7" height="4" fill="#facc15" />
      {/* head block */}
      <rect x="30" y="20" width="60" height="46" rx="14" fill="url(#omH)" stroke={LINE} strokeWidth="2.4" />
      <path d="M 60 20 L 60 12" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="10" r="3" fill="#d81e1e" stroke={LINE} strokeWidth="1.6" />
      {/* red visor */}
      <rect x="36" y="38" width="48" height="15" rx="7.5" fill="#10131f" stroke={LINE} strokeWidth="2" />
      <ellipse cx="50" cy="45.5" rx="5" ry="3.4" fill={glow} />
      <ellipse cx="70" cy="45.5" rx="5" ry="3.4" fill={glow} />
      <circle cx="51.4" cy="44.6" r="1.3" fill="#ffd7d7" />
      <circle cx="71.4" cy="44.6" r="1.3" fill="#ffd7d7" />
      {/* forehead lamp + jaw grill */}
      <circle cx="60" cy="30" r="3.2" fill="#facc15" stroke={LINE} strokeWidth="1.6" />
      <path d="M 46 59 h 6 M 57 59 h 6 M 68 59 h 3" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
    </Frame>
  )
}

/* ----------------------------- SUPER SONIC ---------------------------- */

export function SuperSonic({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame shine="superShine">
      <BodyGrad id="supB" from="#ffe066" to="#d99400" mid="#ffc93e" />
      <GroundShadow />
      {/* golden aura */}
      <circle cx="60" cy="58" r="47" fill="#fde047" opacity="0.25" />
      <circle cx="60" cy="58" r="38" fill="#fef9c3" opacity="0.25" />
      {/* rising sparks */}
      <path d="M 26 34 l 1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 Z" fill="#fde047" />
      <path d="M 94 26 l 1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 Z" fill="#fde047" />
      <path d="M 92 88 l 1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1 Z" fill="#fef9c3" />
      <SweptQuills
        fill="url(#supB)"
        paths={[
          'M 80 36 C 93 36 102 41 106 52 C 97 54 88 52 82 48 C 80 44 79 40 80 36 Z',
          'M 81 52 C 94 53 102 59 104 70 C 96 71 88 68 83 63 C 81 59 80 55 81 52 Z',
          'M 77 64 C 88 66 95 73 97 84 C 89 85 81 80 75 73 C 75 70 75 67 77 64 Z',
        ]}
      />
      {/* ears */}
      <path d="M 46 22 L 40 7 L 58 16 Z" fill="url(#supB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 74 22 L 80 7 L 62 16 Z" fill="url(#supB)" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 47 19 L 43.5 10 L 53 15.5 Z" fill="#f6d7a5" />
      <path d="M 73 19 L 76.5 10 L 67 15.5 Z" fill="#f6d7a5" />
      <Legs body="#e0a100" />
      <Torso body="url(#supB)" belly="#f6d7a5" />
      <Sneaker x={49} color="#d81e1e" cuff="#facc15" />
      <Sneaker x={71} color="#d81e1e" cuff="#facc15" />
      {/* head */}
      <circle cx="60" cy="50" r="32" fill="url(#supB)" stroke={LINE} strokeWidth="2.4" />
      <HeadShine />
      <ellipse cx="60" cy="67" rx="19" ry="12.5" fill="#f6d7a5" />
      <ellipse cx="60" cy="74" rx="13" ry="5" fill="#eec489" opacity="0.5" />
      <HedgehogEyes ex={ex} iris="#ef4444" cy={46} />
      <BlinkLids spots={[[49.5, 46], [70.5, 46]]} rx={11} ry={9} fill="#e0a100" />
      <ellipse cx="60" cy="58.5" rx="4.6" ry="3.6" fill="#1f2430" />
      <circle cx="58.6" cy="57.4" r="1" fill="#fff" opacity="0.8" />
      <Mouth x={60} y={70} ex={ex} />
      <Blush x1={37} x2={83} y={63} />
    </Frame>
  )
}

export const MASCOTS: Record<string, (p: MascotProps) => JSX.Element> = {
  sonic: Sonic,
  tails: Tails,
  knuckles: Knuckles,
  amy: Amy,
  shadow: Shadow,
  silver: Silver,
  metal: MetalSonic,
  cream: Cream,
  blaze: Blaze,
  rouge: Rouge,
  eggman: Eggman,
  charmy: CharmyBee,
  big: BigCat,
  ray: RaySquirrel,
  vector: VectorCroc,
  espio: EspioCham,
  omega: OmegaBot,
  jet: JetHawk,
  super: SuperSonic,
}

export function Mascot({ id, ...rest }: MascotProps & { id: string }) {
  const C = MASCOTS[id] ?? Sonic
  return <C {...rest} />
}