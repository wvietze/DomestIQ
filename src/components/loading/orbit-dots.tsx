'use client'

import { Home, Flower2, Wrench } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { box: number; icon: number; radius: number }> = {
  sm: { box: 24, icon: 8, radius: 8 },
  md: { box: 48, icon: 14, radius: 16 },
  lg: { box: 80, icon: 20, radius: 28 },
  full: { box: 120, icon: 26, radius: 42 },
}

const icons = [
  { Icon: Home, color: '#047857' },
  { Icon: Flower2, color: '#0d9488' },
  { Icon: Wrench, color: '#D97706' },
]

export function OrbitDots({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
      {icons.map(({ Icon, color }, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: `orbit ${1.4 + i * 0.2}s linear infinite`,
            ['--orbit-radius' as string]: `${cfg.radius}px`,
            animationDelay: `${i * -0.4}s`,
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

  return <div className="flex items-center justify-center" style={{ width: cfg.box, height: cfg.box }}>{content}</div>
}
