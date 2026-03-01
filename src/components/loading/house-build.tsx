'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, number> = {
  sm: 24,
  md: 48,
  lg: 80,
  full: 120,
}

export function HouseBuild({ size = 'full' }: { size?: Size }) {
  const s = sizeConfig[size]
  // House path: roof triangle + walls + door
  const housePath = 'M5 20 L5 12 L20 3 L35 12 L35 20 Z M14 20 L14 15 L22 15 L22 20'
  const totalLength = 140

  const content = (
    <svg width={s} height={s} viewBox="0 0 40 24" fill="none">
      <path
        d={housePath}
        stroke="url(#hb-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: totalLength,
          ['--dash-total' as string]: totalLength,
          animation: 'draw-line 2s ease-in-out infinite',
        }}
      />
      <defs>
        <linearGradient id="hb-grad" x1="5" y1="3" x2="35" y2="20">
          <stop stopColor="#047857" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full">{content}</div>
  }

  return <div className="flex items-center justify-center" style={{ width: s, height: s }}>{content}</div>
}
