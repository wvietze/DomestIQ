'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { dot: number; gap: number }> = {
  sm: { dot: 5, gap: 3 },
  md: { dot: 8, gap: 5 },
  lg: { dot: 12, gap: 8 },
  full: { dot: 16, gap: 10 },
}

const colors = ['#047857', '#0d9488', '#D97706']

export function BouncingDots({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="flex items-center" style={{ gap: cfg.gap }}>
      {colors.map((color, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: cfg.dot,
            height: cfg.dot,
            background: color,
            animation: `bounce-dot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
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
