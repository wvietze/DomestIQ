'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { block: number; gap: number }> = {
  sm: { block: 8, gap: 2 },
  md: { block: 14, gap: 3 },
  lg: { block: 22, gap: 4 },
  full: { block: 30, gap: 5 },
}

const colors = ['#047857', '#0d9488', '#D97706']

export function StackingBlocks({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <div className="flex items-end" style={{ gap: cfg.gap, height: cfg.block * 3 + cfg.gap * 2 }}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-(cfg.block * 2 + cfg.gap * 2), 0],
            opacity: [0, 1],
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: 'easeOut',
          }}
          style={{
            width: cfg.block,
            height: cfg.block,
            background: color,
            borderRadius: cfg.block * 0.15,
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
