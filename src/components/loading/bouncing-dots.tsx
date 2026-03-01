'use client'

import { motion } from 'framer-motion'
import { Home, Flower2, Wrench } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { icon: number; gap: number; bounce: number }> = {
  sm: { icon: 10, gap: 4, bounce: 6 },
  md: { icon: 18, gap: 8, bounce: 10 },
  lg: { icon: 26, gap: 12, bounce: 14 },
  full: { icon: 34, gap: 16, bounce: 18 },
}

const icons = [
  { Icon: Home, color: '#047857', glow: 'rgba(4,120,87,0.2)' },
  { Icon: Flower2, color: '#0d9488', glow: 'rgba(13,148,136,0.2)' },
  { Icon: Wrench, color: '#D97706', glow: 'rgba(217,119,6,0.2)' },
]

export function BouncingDots({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const isSmall = size === 'sm'

  const content = (
    <div className="flex items-center" style={{ gap: cfg.gap }}>
      {icons.map(({ Icon, color, glow }, i) => (
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
            <Icon size={cfg.icon} color={color} strokeWidth={2.5} />
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
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
