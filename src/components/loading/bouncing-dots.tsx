'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { icon: number; gap: number; bounce: number }> = {
  sm: { icon: 14, gap: 4, bounce: 6 },
  md: { icon: 22, gap: 8, bounce: 10 },
  lg: { icon: 30, gap: 12, bounce: 14 },
  full: { icon: 38, gap: 16, bounce: 18 },
}

const icons = [
  { name: 'home', color: '#005d42', glow: 'rgba(0,93,66,0.2)' },
  { name: 'yard', color: '#047857', glow: 'rgba(4,120,87,0.2)' },
  { name: 'build', color: '#904d00', glow: 'rgba(144,77,0,0.2)' },
]

export function BouncingDots({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const isSmall = size === 'sm'

  const content = (
    <div className="flex items-center" style={{ gap: cfg.gap }}>
      {icons.map(({ name, color, glow }, i) => (
        <div key={i} className="flex flex-col items-center" style={{ gap: isSmall ? 1 : 2 }}>
          <motion.div
            animate={{
              y: [0, -cfg.bounce, 0],
              rotate: [0, -8, 8, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.15,
              repeat: Infinity,
              repeatDelay: 0.4,
              ease: 'easeInOut',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: cfg.icon, color, fontVariationSettings: "'FILL' 1, 'wght' 600" }}
            >
              {name}
            </span>
          </motion.div>
          {/* Landing shadow */}
          {!isSmall && (
            <motion.div
              className="rounded-full"
              style={{
                width: cfg.icon * 0.6,
                height: isSmall ? 1 : 2,
                background: glow,
              }}
              animate={{
                scaleX: [1, 0.5, 1],
                opacity: [0.6, 0.2, 0.6],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 0.4,
                ease: 'easeInOut',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full bg-[#f9f9f7]">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
