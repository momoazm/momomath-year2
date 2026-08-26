/** Fixed Green-Hill-Zone scenery: sun, drifting clouds, hills, palms, floating rings. */
export function Scenery() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
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

      {/* drifting clouds */}
      <div className="gpu animate-drift absolute left-0 top-[9%]" style={{ animationDuration: '95s' }}>
        <Cloud size={92} />
      </div>
      <div className="gpu animate-drift absolute left-0 top-[22%]" style={{ animationDuration: '140s', animationDelay: '-60s' }}>
        <Cloud size={64} />
      </div>
      <div className="gpu animate-drift absolute left-0 top-[5%]" style={{ animationDuration: '120s', animationDelay: '-100s' }}>
        <Cloud size={48} />
      </div>

      {/* floating golden rings */}
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

function Ring({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="13" fill="none" stroke="#c9971c" strokeWidth="7" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#ffd23e" strokeWidth="5" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#fff3b0" strokeWidth="1.6" strokeDasharray="10 60" />
    </svg>
  )
}
