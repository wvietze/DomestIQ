'use client'

import { Home, Flower2, Wrench } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { icon: number; gap: number }> = {
  sm: { icon: 10, gap: 3 },
  md: { icon: 16, gap: 6 },
  lg: { icon: 24, gap: 10 },
  full: { icon: 32, gap: 14 },
}

const icons = [
  { Icon: Home, color: '#047857' },
  { Icon: Flower2, color: '#0d9488' },
  { Icon: Wrench, color: '#D97706' },
]

export function BouncingDots({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="flex items-center" style={{ gap: cfg.gap }}>
      {icons.map(({ Icon, color }, i) => (
        <div
          key={i}
          style={{
            animation: `bounce-dot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        >
          <Icon size={cfg.icon} color={color} strokeWidth={2.5} />
        </div>
      ))}
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
