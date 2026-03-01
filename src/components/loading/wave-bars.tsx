'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { barW: number; barMaxH: number; gap: number }> = {
  sm: { barW: 3, barMaxH: 16, gap: 2 },
  md: { barW: 5, barMaxH: 30, gap: 3 },
  lg: { barW: 8, barMaxH: 48, gap: 5 },
  full: { barW: 11, barMaxH: 68, gap: 7 },
}

// Varied heights for organic skyline silhouette (shorter edges, tallest center)
const heightRatios = [0.45, 0.7, 1, 0.85, 0.55]

export function WaveBars({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const totalW = 5 * cfg.barW + 4 * cfg.gap
  const isSmall = size === 'sm'

  const content = (
    <div className="flex flex-col items-center" style={{ gap: isSmall ? 1 : 3 }}>
      {/* Bars container */}
      <div className="relative flex items-end" style={{ gap: cfg.gap, height: cfg.barMaxH }}>
        {/* Warm glow behind bars */}
        {!isSmall && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: totalW * 0.7,
              height: cfg.barMaxH * 0.4,
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse, rgba(217,119,6,0.15) 0%, transparent 70%)',
              filter: 'blur(4px)',
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {heightRatios.map((ratio, i) => {
          const barH = Math.round(cfg.barMaxH * ratio)
          return (
            <motion.div
              key={i}
              className="rounded-full relative z-10"
              style={{
                width: cfg.barW,
                height: barH,
                background: `linear-gradient(to top, #D97706 0%, #b45309 20%, #059669 60%, #047857 100%)`,
                transformOrigin: 'bottom',
              }}
              animate={{ scaleY: [0.25, 1, 0.25] }}
              transition={{
                duration: 1.2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </div>
      {/* Amber horizon line with gradient fade */}
      <div
        className="rounded-full"
        style={{
          width: totalW + cfg.gap * 2,
          height: isSmall ? 1 : 2,
          background: 'linear-gradient(to right, transparent, #D97706, transparent)',
          opacity: 0.7,
        }}
      />
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
