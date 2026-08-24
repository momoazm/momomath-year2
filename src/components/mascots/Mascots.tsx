import type { Expression, MascotProps } from '../../content/types'

function Eyes({ x1, x2, y, expression, iris }: { x1: number; x2: number; y: number; expression: Expression; iris?: string }) {
  if (expression === 'sad')
    return (
      <g>
        <path d={`M ${x1 - 7} ${y - 6} q 7 -5 14 0`} stroke="#222" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d={`M ${x2 - 7} ${y - 6} q 7 -5 14 0`} stroke="#222" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    )
  if (expression === 'excited' || expression === 'cheer')
    return (
      <g>
        {iris && (
          <g>
            <circle cx={x1} cy={y} r="8.6" fill={iris} opacity="0.55" />
            <circle cx={x2} cy={y} r="8.6" fill={iris} opacity="0.55" />
          </g>
        )}
        <circle cx={x1} cy={y} r="8" fill="#fff" stroke="#222" strokeWidth="2.5" />
        <circle cx={x2} cy={y} r="8" fill="#fff" stroke="#222" strokeWidth="2.5" />
        <circle cx={x1} cy={y} r="3.4" fill={iris ? '#1a1c2e' : '#222'} />
        <circle cx={x2} cy={y} r="3.4" fill={iris ? '#1a1c2e' : '#222'} />
        <circle cx={x1 + 3} cy={y - 3} r="1.6" fill="#fff" />
        <circle cx={x2 + 3} cy={y - 3} r="1.6" fill="#fff" />
      </g>
    )
  return (
    <g>
      {iris && (
        <g>
          <ellipse cx={x1} cy={y} rx="9" ry="10.6" fill={iris} opacity="0.55" />
          <ellipse cx={x2} cy={y} rx="9" ry="10.6" fill={iris} opacity="0.55" />
        </g>
      )}
      <ellipse cx={x1} cy={y} rx="7" ry="9" fill="#fff" stroke="#222" strokeWidth="2.5" />
      <ellipse cx={x2} cy={y} rx="7" ry="9" fill="#fff" stroke="#222" strokeWidth="2.5" />
      <circle cx={x1} cy={y + 1} r="3.2" fill={iris ? '#1a1c2e' : '#222'} />
      <circle cx={x2} cy={y + 1} r="3.2" fill={iris ? '#1a1c2e' : '#222'} />
      <circle cx={x1 + 2.5} cy={y - 3} r="1.4" fill="#fff" />
      <circle cx={x2 + 2.5} cy={y - 3} r="1.4" fill="#fff" />
    </g>
  )
}

function Mouth({ x, y, expression }: { x: number; y: number; expression: Expression }) {
  if (expression === 'sad')
    return <path d={`M ${x - 9} ${y + 6} q 9 -8 18 0`} stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round" />
  if (expression === 'thinking') return <circle cx={x} cy={y + 2} r="3.4" fill="#222" />
  if (expression === 'excited' || expression === 'cheer')
    return (
      <path
        d={`M ${x - 11} ${y} q 11 16 22 0 z`}
        fill="#7c2d12"
        stroke="#222"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    )
  return <path d={`M ${x - 9} ${y - 2} q 9 10 18 0`} stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round" />
}

const Blush = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => (
  <g opacity="0.55">
    <ellipse cx={x1} cy={y} rx="6" ry="3.6" fill="#fb7185" />
    <ellipse cx={x2} cy={y} rx="6" ry="3.6" fill="#fb7185" />
  </g>
)

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-md" role="img" aria-hidden>
      {children}
    </svg>
  )
}

function Sneakers({ left = 47, right = 73, color = '#e23636' }: { left?: number; right?: number; color?: string }) {
  return (
    <g>
      <ellipse cx={left} cy="97" rx="11" ry="6" fill={color} />
      <rect x={left - 10} y="95" width="20" height="3.4" rx="1.7" fill="#fff" />
      <ellipse cx={right} cy="97" rx="11" ry="6" fill={color} />
      <rect x={right - 10} y="95" width="20" height="3.4" rx="1.7" fill="#fff" />
    </g>
  )
}

/** Sonic - the blue blur himself. Swept-back quills, tan muzzle, red power sneakers. */
export function Sonic({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame>
      <path d="M32 46 Q4 42 10 26 Q22 34 28 31 Q16 18 30 12 Q38 24 44 22 L46 38 Z" fill="#1e49c8" />
      <path d="M88 46 Q116 42 110 26 Q98 34 92 31 Q104 18 90 12 Q82 24 76 22 L74 38 Z" fill="#1e49c8" />
      <path d="M28 60 Q6 64 12 80 Q22 72 30 74 Z" fill="#1e49c8" />
      <path d="M92 60 Q114 64 108 80 Q98 72 90 74 Z" fill="#1e49c8" />
      <circle cx="60" cy="56" r="33" fill="#2456e0" />
      <ellipse cx="60" cy="70" rx="21" ry="15" fill="#f6d7a5" />
      <Eyes x1={48} x2={72} y={52} expression={ex} />
      <Blush x1={33} x2={87} y={64} />
      <Mouth x={60} y={73} expression={ex} />
      <ellipse cx="60" cy="63" rx="4.6" ry="3.4" fill="#111827" />
      <Sneakers />
      {ex === 'cheer' && <text x="96" y="24" fontSize="18">⚡</text>}
    </Frame>
  )
}

/** Tails - the two-tailed fox genius with propeller tails and white-tipped ears. */
export function Tails({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame>
      <g className="gpu origin-[86px_74px] animate-float-y">
        <path d="M84 72 q24 -12 30 -26 q6 14 -8 24 q12 -2 12 5 q-14 10 -36 6 Z" fill="#f59e0b" />
        <path d="M104 50 q6 -6 4 -10 q6 6 0 12 Z" fill="#fff" />
      </g>
      <g className="gpu origin-[86px_84px] animate-float-y" style={{ animationDelay: '-1.2s' }}>
        <path d="M84 82 q26 0 36 -12 q4 15 -10 23 q12 0 11 6 q-15 9 -38 1 Z" fill="#ef8f1f" />
        <path d="M110 73 q6 -6 4 -10 q7 6 0 13 Z" fill="#fff" />
      </g>
      <path d="M32 34 L27 9 L52 26 Z" fill="#f59e0b" />
      <path d="M88 34 L93 9 L68 26 Z" fill="#f59e0b" />
      <path d="M36 29 L34 16 L47 25 Z" fill="#fff" />
      <path d="M84 29 L86 16 L73 25 Z" fill="#fff" />
      <circle cx="60" cy="58" r="32" fill="#ffab2e" />
      <ellipse cx="60" cy="71" rx="21" ry="15" fill="#fff" />
      <Eyes x1={49} x2={71} y={54} expression={ex} />
      <Blush x1={34} x2={86} y={66} />
      <Mouth x={60} y={74} expression={ex} />
      <ellipse cx="60" cy="65" rx="3.2" ry="2.4" fill="#78350f" />
      <Sneakers />
      {ex === 'cheer' && <text x="94" y="26" fontSize="18">🌀</text>}
    </Frame>
  )
}

/** Knuckles - the red echidna powerhouse with dreadlocks and chest crescent. */
export function Knuckles({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame>
      <path d="M28 46 Q6 56 12 82 Q20 74 27 77 Q18 90 30 95 Q37 85 39 78 Z" fill="#c22a23" />
      <path d="M92 46 Q114 56 108 82 Q100 74 93 77 Q102 90 90 95 Q83 85 81 78 Z" fill="#c22a23" />
      <circle cx="60" cy="57" r="32" fill="#e0392f" />
      <path d="M40 40 Q46 32 54 34 M80 40 Q74 32 66 34" stroke="#c22a23" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="71" rx="20" ry="14" fill="#ffd9c9" />
      <Eyes x1={50} x2={70} y={53} expression={ex} iris="#7bc043" />
      <Blush x1={35} x2={85} y={66} />
      <Mouth x={60} y={73} expression={ex} />
      <ellipse cx="60" cy="65" rx="3.4" ry="2.6" fill="#7f1d1d" />
      <path d="M45 88 Q60 99 75 88" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" />
      <g className="gpu">
        <circle cx="22" cy="88" r="8" fill="#fff" />
        <path d="M15 82 l-6 -3 M14 89 l-7 0 M15 95 l-6 3" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <Sneakers color="#2f9e44" />
      {ex === 'cheer' && <text x="94" y="28" fontSize="17">👊</text>}
    </Frame>
  )
}

/** Amy Rose - the pink hedgehog with her signature red headband. */
export function Amy({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame>
      <path d="M31 48 Q8 46 13 31 Q25 38 32 35 Z" fill="#ee64ae" />
      <path d="M89 48 Q112 46 107 31 Q95 38 88 35 Z" fill="#ee64ae" />
      <path d="M42 30 Q60 18 78 30 L74 40 Q60 32 46 40 Z" fill="#ee64ae" />
      <circle cx="60" cy="58" r="31" fill="#f472b6" />
      <path d="M31 43 Q60 28 89 43" stroke="#e23636" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="71" rx="19" ry="13" fill="#ffe1ef" />
      <Eyes x1={49} x2={71} y={54} expression={ex} />
      <Blush x1={35} x2={85} y={68} />
      <Mouth x={60} y={73} expression={ex} />
      <ellipse cx="60" cy="64" rx="3" ry="2.3" fill="#be185d" />
      <g transform="translate(96 66)">
        <rect x="-3" y="-2" width="26" height="7" rx="3.5" fill="#94a3b8" />
        <rect x="-8" y="-6" width="14" height="15" rx="3" fill="#e23636" />
      </g>
      <Sneakers />
      {ex === 'cheer' && <text x="92" y="26" fontSize="17">🌸</text>}
    </Frame>
  )
}

/** Shadow - the ultimate lifeform. Black quills with crimson streaks. */
export function Shadow({ expression = 'happy', className = '' }: MascotProps) {
  const ex = expression
  return (
    <Frame>
      <path d="M32 46 Q4 42 10 26 Q22 34 28 31 Q16 18 30 12 Q38 24 44 22 L46 38 Z" fill="#23252e" />
      <path d="M88 46 Q116 42 110 26 Q98 34 92 31 Q104 18 90 12 Q82 24 76 22 L74 38 Z" fill="#23252e" />
      <path d="M28 60 Q6 64 12 80 Q22 72 30 74 Z" fill="#23252e" />
      <path d="M92 60 Q114 64 108 80 Q98 72 90 74 Z" fill="#23252e" />
      <path d="M30 34 Q18 28 14 20 M90 34 Q102 28 106 20 M26 58 Q12 60 8 70 M94 58 Q108 60 112 70" stroke="#e23636" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.9" />
      <circle cx="60" cy="56" r="33" fill="#2a2c38" />
      <ellipse cx="60" cy="72" rx="19" ry="14" fill="#f4f6fb" />
      <Eyes x1={48} x2={72} y={52} expression={ex} iris="#ff4b4b" />
      <Mouth x={60} y={74} expression={ex} />
      <ellipse cx="60" cy="63" rx="4.4" ry="3.2" fill="#111827" />
      <Sneakers color="#d81e1e" />
      {ex === 'cheer' && <text x="94" y="24" fontSize="18">🌑</text>}
    </Frame>
  )
}

export const MASCOTS: Record<string, (p: MascotProps) => JSX.Element> = {
  sonic: Sonic,
  tails: Tails,
  knuckles: Knuckles,
  amy: Amy,
  shadow: Shadow,
}

export function Mascot({ id, ...rest }: MascotProps & { id: string }) {
  const C = MASCOTS[id] ?? Sonic
  return <C {...rest} />
}
