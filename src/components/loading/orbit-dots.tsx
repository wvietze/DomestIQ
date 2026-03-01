'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { box: number; dot: number; radius: number }> = {
  sm: { box: 24, dot: 4, radius: 8 },
  md: { box: 48, dot: 6, radius: 16 },
  lg: { box: 80, dot: 10, radius: 28 },
  full: { box: 120, dot: 14, radius: 42 },
}

const colors = ['#047857', '#0d9488', '#D97706']

export function OrbitDots({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
      {colors.map((color, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: `orbit ${1.4 + i * 0.2}s linear infinite`,
            ['--orbit-radius' as string]: `${cfg.radius}px`,
            animationDelay: `${i * -0.4}s`,
          }}
        >
          <div
            className="rounded-full"
            style={{ width: cfg.dot, height: cfg.dot, background: color }}
          />
        </div>
      ))}
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full">{content}</div>
  }

  return <div className="flex items-center justify-center" style={{ width: cfg.box, height: cfg.box }}>{content}</div>
}
