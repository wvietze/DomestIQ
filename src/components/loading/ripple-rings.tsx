'use client'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { box: number; ringSize: number; iconSize: string }> = {
  sm: { box: 24, ringSize: 16, iconSize: 'text-xs' },
  md: { box: 48, ringSize: 32, iconSize: 'text-lg' },
  lg: { box: 80, ringSize: 52, iconSize: 'text-2xl' },
  full: { box: 120, ringSize: 80, iconSize: 'text-4xl' },
}

export function RippleRings({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const ringCount = size === 'sm' ? 1 : 3

  const content = (
    <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
      {/* Ripple rings */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-[#005d42]/60"
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
      {/* MapPin icon at center */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span className={`material-symbols-outlined text-[#005d42] ${cfg.iconSize}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          location_on
        </span>
      </div>
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center" style={{ width: cfg.box, height: cfg.box }}>{content}</div>
}
