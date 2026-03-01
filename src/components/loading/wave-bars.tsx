'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { barW: number; barH: number; gap: number; count: number }> = {
  sm: { barW: 3, barH: 16, gap: 2, count: 4 },
  md: { barW: 5, barH: 28, gap: 3, count: 5 },
  lg: { barW: 7, barH: 44, gap: 4, count: 5 },
  full: { barW: 10, barH: 64, gap: 6, count: 5 },
}

const colors = ['#047857', '#059669', '#0d9488', '#D97706', '#047857']

export function WaveBars({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="flex items-center" style={{ gap: cfg.gap, height: cfg.barH }}>
      {Array.from({ length: cfg.count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: cfg.barW,
            height: cfg.barH,
            background: colors[i % colors.length],
            animation: `wave-bar 1s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
