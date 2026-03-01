'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { s: number; stroke: number }> = {
  sm: { s: 24, stroke: 3 },
  md: { s: 48, stroke: 4 },
  lg: { s: 80, stroke: 5 },
  full: { s: 120, stroke: 6 },
}

export function GradientSpinner({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const r = (cfg.s - cfg.stroke) / 2
  const circ = 2 * Math.PI * r

  const content = (
    <svg
      width={cfg.s}
      height={cfg.s}
      viewBox={`0 0 ${cfg.s} ${cfg.s}`}
      style={{ animation: 'sweep-rotate 1.2s linear infinite' }}
    >
      <defs>
        <linearGradient id="gs-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle
        cx={cfg.s / 2}
        cy={cfg.s / 2}
        r={r}
        fill="none"
        stroke="url(#gs-grad)"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        strokeDasharray={`${circ * 0.7} ${circ * 0.3}`}
      />
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
