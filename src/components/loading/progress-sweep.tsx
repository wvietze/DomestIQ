'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { s: number; stroke: number }> = {
  sm: { s: 24, stroke: 2 },
  md: { s: 48, stroke: 2.5 },
  lg: { s: 80, stroke: 3 },
  full: { s: 120, stroke: 3.5 },
}

export function ProgressSweep({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const cx = cfg.s / 2
  const cy = cfg.s * 0.6 // horizon sits at 60% down
  const horizonY = cy
  const arcR = cfg.s * 0.3
  const rayLen = cfg.s * 0.08

  // Arc path: semicircle above horizon
  const arcPath = `M ${cx - arcR} ${horizonY} A ${arcR} ${arcR} 0 0 1 ${cx + arcR} ${horizonY}`
  const arcLength = Math.PI * arcR

  // Sun rays positioned around the arc
  const rayCount = size === 'sm' ? 3 : 5
  const rays = Array.from({ length: rayCount }).map((_, i) => {
    const angle = Math.PI - (i / (rayCount - 1)) * Math.PI // 180° to 0°
    const innerR = arcR + cfg.stroke * 2
    const outerR = innerR + rayLen
    const x1 = cx + Math.cos(angle) * innerR
    const y1 = horizonY - Math.sin(angle) * innerR
    const x2 = cx + Math.cos(angle) * outerR
    const y2 = horizonY - Math.sin(angle) * outerR
    return { x1, y1, x2, y2 }
  })

  const content = (
    <svg width={cfg.s} height={cfg.s} viewBox={`0 0 ${cfg.s} ${cfg.s}`} fill="none">
      <defs>
        <linearGradient id="sa-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Emerald horizon line */}
      <line
        x1={cx - arcR - rayLen}
        y1={horizonY}
        x2={cx + arcR + rayLen}
        y2={horizonY}
        stroke="#047857"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
      />

      {/* Amber arc that sweeps over the horizon */}
      <path
        d={arcPath}
        stroke="url(#sa-grad)"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: arcLength,
          ['--dash-total' as string]: arcLength,
          animation: 'draw-line 2s ease-in-out infinite',
        }}
      />

      {/* Sun rays that appear after the arc draws */}
      {rays.map((ray, i) => (
        <line
          key={i}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke="#D97706"
          strokeWidth={Math.max(1, cfg.stroke * 0.6)}
          strokeLinecap="round"
          style={{
            opacity: 0,
            animation: `pulse-soft 2s ease-in-out infinite`,
            animationDelay: `${0.8 + i * 0.1}s`,
          }}
        />
      ))}

      {/* Small green ground texture below horizon */}
      <line
        x1={cx - arcR * 0.6}
        y1={horizonY + cfg.stroke * 3}
        x2={cx + arcR * 0.6}
        y2={horizonY + cfg.stroke * 3}
        stroke="#047857"
        strokeWidth={Math.max(0.5, cfg.stroke * 0.4)}
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
