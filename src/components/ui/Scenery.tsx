import { useEffect } from 'react'
import { usePlayer } from '../../engine/store'

/** Subject-aware fixed scenery: green hills by day (maths + extras), a warm
 *  sunrise glow for english, and a starry alien night for science. The body
 *  sky gradient tracks the subject too (the stylesheet holds the day default). */
export function Scenery() {
  const subject = usePlayer((s) => s.subject)
  const space = subject === 'science'

  useEffect(() => {
    const b = document.body
    if (space) {
      b.style.backgroundColor = '#0b1030'
      b.style.backgroundImage = 'linear-gradient(#0b1030 0%, #141a4d 45%, #241b62 75%, #37257a 100%)'
    } else if (subject === 'english') {
      b.style.backgroundColor = '#ffe9c7'
      b.style.backgroundImage = 'linear-gradient(#ff9d5c 0%, #ffc178 45%, #ffe6bd 75%, #fff8ec 100%)'
    } else {
      b.style.backgroundColor = ''
      b.style.backgroundImage = ''
    }
  }, [subject, space])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {space ? <SpaceBackdrop /> : <DayBackdrop />}

      {/* drifting clouds (day) / nebula wisps (space) */}
      {space ? (
        <>
          <div className="gpu animate-drift absolute left-0 top-[12%] opacity-70" style={{ animationDuration: '160s' }}>
            <Nebula size={150} />
          </div>
          <div className="gpu animate-drift absolute left-0 top-[34%] opacity-50" style={{ animationDuration: '210s', animationDelay: '-90s' }}>
            <Nebula size={110} />
          </div>
        </>
      ) : (
        <>
          <div className="gpu animate-drift absolute left-0 top-[9%]" style={{ animationDuration: '95s' }}>
            <Cloud size={92} />
          </div>
          <div className="gpu animate-drift absolute left-0 top-[22%]" style={{ animationDuration: '140s', animationDelay: '-60s' }}>
            <Cloud size={64} />
          </div>
          <div className="gpu animate-drift absolute left-0 top-[5%]" style={{ animationDuration: '120s', animationDelay: '-100s' }}>
            <Cloud size={48} />
          </div>
        </>
      )}

      {/* floating golden rings (brand motif - reads as golden asteroids in space) */}
      <div className="gpu animate-ring-bob absolute left-[7%] top-[30%]" style={{ animationDuration: '3.4s' }}>
        <Ring size={34} />
      </div>
      <div className="gpu animate-ring-bob absolute right-[9%] top-[38%]" style={{ animationDuration: '4.2s', animationDelay: '-1.6s' }}>
        <Ring size={26} />
      </div>
      <div className="gpu animate-ring-bob absolute left-[16%] top-[58%]" style={{ animationDuration: '3.8s', animationDelay: '-2.4s' }}>
        <Ring size={22} />
      </div>
    </div>
  )
}

/** Green-Hill-Zone day: sun, hills, checkered dirt, palms. */
function DayBackdrop() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice">
      {/* sun */}
      <circle cx="86" cy="10" r="14" fill="#ffe27a" opacity="0.35" />
      <circle cx="86" cy="10" r="8.5" fill="#ffd23e" opacity="0.9" />
      {/* far hills */}
      <ellipse cx="18" cy="102" rx="42" ry="26" fill="#7ede2e" />
      <ellipse cx="86" cy="104" rx="48" ry="30" fill="#5ecb16" />
      <ellipse cx="52" cy="108" rx="46" ry="26" fill="#46a804" />
      {/* checkered dirt band */}
      <rect x="0" y="94" width="100" height="7" fill="#b98a55" />
      <g opacity="0.55">
        {[...Array(14)].map((_, i) => (
          <rect key={i} x={i * 7.5} y="94" width="3.75" height="3.5" fill="#92663c" />
        ))}
        {[...Array(14)].map((_, i) => (
          <rect key={i} x={i * 7.5 + 3.75} y="97.5" width="3.75" height="3.5" fill="#92663c" />
        ))}
      </g>
      {/* palm left */}
      <g transform="translate(9 76) scale(0.9)">
        <path d="M 0 22 C -2 12 0 4 3 -2 L 6 -1 C 3 5 2 13 4 22 Z" fill="#8a5a33" />
        <g fill="#2f9e44">
          <path d="M 4 -2 C -6 -8 -14 -7 -18 -2 C -10 -4 -3 -2 4 -2 Z" />
          <path d="M 4 -2 C 14 -8 22 -7 26 -2 C 18 -4 11 -2 4 -2 Z" />
          <path d="M 4 -3 C -2 -12 -1 -18 4 -21 C 8 -17 8 -9 5 -3 Z" />
          <path d="M 4 -2 C -8 -4 -14 -12 -13 -17 C -7 -13 -2 -7 4 -2 Z" opacity="0.9" />
          <path d="M 4 -2 C 16 -4 21 -12 20 -17 C 14 -13 9 -7 4 -2 Z" opacity="0.9" />
        </g>
        <circle cx="1.5" cy="-1" r="1.6" fill="#6b4423" />
        <circle cx="6.5" cy="-1.5" r="1.6" fill="#6b4423" />
      </g>
      {/* palm right (smaller, flipped) */}
      <g transform="translate(91 80) scale(-0.72 0.72)">
        <path d="M 0 22 C -2 12 0 4 3 -2 L 6 -1 C 3 5 2 13 4 22 Z" fill="#8a5a33" />
        <g fill="#3da53b">
          <path d="M 4 -2 C -6 -8 -14 -7 -18 -2 C -10 -4 -3 -2 4 -2 Z" />
          <path d="M 4 -2 C 14 -8 22 -7 26 -2 C 18 -4 11 -2 4 -2 Z" />
          <path d="M 4 -3 C -2 -12 -1 -18 4 -21 C 8 -17 8 -9 5 -3 Z" />
          <path d="M 4 -2 C -8 -4 -14 -12 -13 -17 C -7 -13 -2 -7 4 -2 Z" opacity="0.9" />
          <path d="M 4 -2 C 16 -4 21 -12 20 -17 C 14 -13 9 -7 4 -2 Z" opacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

/** Science backdrop: twinkling stars, moon, purple alien hills, glowing
 *  crystal spires on a dark rocky ground. */
const STARS: [number, number, number][] = [
  [6, 8, 0.7], [14, 22, 0.5], [22, 6, 0.9], [30, 16, 0.6], [38, 30, 0.5], [46, 9, 0.8],
  [54, 24, 0.6], [62, 5, 0.7], [70, 18, 0.5], [78, 30, 0.8], [86, 7, 0.6], [94, 20, 0.7],
  [10, 38, 0.5], [26, 44, 0.6], [42, 40, 0.5], [58, 46, 0.7], [74, 42, 0.5], [90, 38, 0.6],
  [18, 54, 0.5], [50, 56, 0.6], [82, 52, 0.5], [34, 62, 0.6], [66, 60, 0.5], [4, 66, 0.6],
]

function SpaceBackdrop() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice">
      {/* twinkling stars */}
      {STARS.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="#ffffff"
          className="animate-pulse"
          style={{ animationDelay: `${(i % 7) * 0.6}s` }}
        />
      ))}
      {/* ringed planet */}
      <g opacity="0.85">
        <circle cx="16" cy="14" r="7" fill="#7c5cff" />
        <ellipse cx="16" cy="14" rx="11" ry="3" fill="none" stroke="#c4b5fd" strokeWidth="1.2" opacity="0.9" />
      </g>
      {/* moon */}
      <circle cx="85" cy="11" r="7" fill="#f6f3df" />
      <circle cx="82" cy="9.5" r="1.6" fill="#d9d3ae" />
      <circle cx="87" cy="13.5" r="1.1" fill="#d9d3ae" />
      {/* alien hills */}
      <ellipse cx="18" cy="102" rx="42" ry="26" fill="#3b2a72" />
      <ellipse cx="86" cy="104" rx="48" ry="30" fill="#2c2160" />
      <ellipse cx="52" cy="108" rx="46" ry="26" fill="#221a4f" />
      {/* dark rocky ground with glowing specks */}
      <rect x="0" y="94" width="100" height="7" fill="#171238" />
      <g opacity="0.85">
        {[...Array(14)].map((_, i) => (
          <rect key={i} x={i * 7.5 + 1} y="96" width="1.4" height="1.4" fill="#5ee7ff" />
        ))}
        {[...Array(14)].map((_, i) => (
          <rect key={i} x={i * 7.5 + 4.8} y="99" width="1.2" height="1.2" fill="#c4b5fd" />
        ))}
      </g>
      {/* crystal spires */}
      <g transform="translate(11 80)">
        <path d="M 0 16 L -4 5 L 0 -7 L 4 5 Z" fill="#5ee7ff" opacity="0.95" />
        <path d="M 0 16 L -4 5 L 0 -7 Z" fill="#38bdf8" />
      </g>
      <g transform="translate(90 84) scale(-0.85 0.85)">
        <path d="M 0 16 L -4 5 L 0 -7 L 4 5 Z" fill="#c4b5fd" opacity="0.95" />
        <path d="M 0 16 L -4 5 L 0 -7 Z" fill="#a78bfa" />
      </g>
      <g transform="translate(48 88) scale(0.6)">
        <path d="M 0 16 L -4 5 L 0 -7 L 4 5 Z" fill="#5ee7ff" opacity="0.8" />
        <path d="M 0 16 L -4 5 L 0 -7 Z" fill="#38bdf8" opacity="0.8" />
      </g>
    </svg>
  )
}

function Cloud({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60">
      <g fill="#ffffff" opacity="0.92">
        <ellipse cx="30" cy="40" rx="26" ry="16" />
        <ellipse cx="55" cy="32" rx="24" ry="18" />
        <ellipse cx="76" cy="42" rx="20" ry="13" />
      </g>
      <g fill="#dceeff" opacity="0.8">
        <ellipse cx="40" cy="48" rx="30" ry="8" />
      </g>
    </svg>
  )
}

function Nebula({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 100 50">
      <g fill="#8b5cf6" opacity="0.16">
        <ellipse cx="34" cy="26" rx="30" ry="15" />
        <ellipse cx="62" cy="20" rx="26" ry="13" />
      </g>
      <g fill="#38bdf8" opacity="0.12">
        <ellipse cx="50" cy="32" rx="34" ry="10" />
      </g>
    </svg>
  )
}

function Ring({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="13" fill="none" stroke="#c9971c" strokeWidth="7" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#ffd23e" strokeWidth="5" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#fff3b0" strokeWidth="1.6" strokeDasharray="10 60" />
    </svg>
  )
}
