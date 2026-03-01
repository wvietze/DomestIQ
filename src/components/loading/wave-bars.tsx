'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { barW: number; barH: number; gap: number; count: number }> = {
  sm: { barW: 3, barH: 16, gap: 2, count: 5 },
  md: { barW: 5, barH: 28, gap: 3, count: 5 },
  lg: { barW: 7, barH: 44, gap: 4, count: 5 },
  full: { barW: 10, barH: 64, gap: 6, count: 5 },
}

export function WaveBars({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="flex flex-col items-center" style={{ gap: size === 'sm' ? 1 : 2 }}>
      {/* Bars with sunrise gradient */}
      <div className="flex items-end" style={{ gap: cfg.gap, height: cfg.barH }}>
        {Array.from({ length: cfg.count }).map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: cfg.barW,
              height: cfg.barH,
              background: 'linear-gradient(to top, #D97706, #059669, #047857)',
              animation: `wave-bar 1s ease-in-out infinite`,
              animationDelay: `${i * 0.12}s`,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>
      {/* Amber horizon line */}
      <div
        className="rounded-full"
        style={{
          width: cfg.count * cfg.barW + (cfg.count - 1) * cfg.gap,
          height: size === 'sm' ? 1 : 2,
          background: '#D97706',
          opacity: 0.6,
        }}
      />
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
