'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { box: number; ringSize: number }> = {
  sm: { box: 24, ringSize: 16 },
  md: { box: 48, ringSize: 32 },
  lg: { box: 80, ringSize: 52 },
  full: { box: 120, ringSize: 80 },
}

export function RippleRings({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const ringCount = size === 'sm' ? 1 : 3

  const content = (
    <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
      {Array.from({ length: ringCount }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-emerald-500"
          style={{
            top: '50%',
            left: '50%',
            width: cfg.ringSize,
            height: cfg.ringSize,
            marginLeft: -cfg.ringSize / 2,
            marginTop: -cfg.ringSize / 2,
            animation: `ripple 1.8s ease-out infinite`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0,
          }}
        />
      ))}
      <div
        className="absolute rounded-full bg-emerald-600"
        style={{
          top: '50%',
          left: '50%',
          width: cfg.ringSize * 0.2,
          height: cfg.ringSize * 0.2,
          marginLeft: -(cfg.ringSize * 0.1),
          marginTop: -(cfg.ringSize * 0.1),
        }}
      />
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full">{content}</div>
  }

  return <div className="flex items-center justify-center" style={{ width: cfg.box, height: cfg.box }}>{content}</div>
}
