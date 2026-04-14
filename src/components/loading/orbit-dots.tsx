'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { box: number; icon: number; radius: number }> = {
  sm: { box: 24, icon: 12, radius: 8 },
  md: { box: 48, icon: 18, radius: 16 },
  lg: { box: 80, icon: 24, radius: 28 },
  full: { box: 120, icon: 30, radius: 42 },
}

const icons = [
  { name: 'home', color: '#005d42' },
  { name: 'yard', color: '#047857' },
  { name: 'build', color: '#904d00' },
]

export function OrbitDots({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
      {icons.map(({ name, color }, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: `orbit ${1.4 + i * 0.2}s linear infinite`,
            ['--orbit-radius' as string]: `${cfg.radius}px`,
            animationDelay: `${i * -0.4}s`,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: cfg.icon, color, fontVariationSettings: "'FILL' 1, 'wght' 600" }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full bg-[#f9f9f7]">{content}</div>
  }

  return <div className="flex items-center justify-center" style={{ width: cfg.box, height: cfg.box }}>{content}</div>
}
