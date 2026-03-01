'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, number> = {
  sm: 20,
  md: 40,
  lg: 64,
  full: 80,
}

export function MorphingShapes({ size = 'full' }: { size?: Size }) {
  const s = sizeConfig[size]

  const content = (
    <motion.div
      animate={{
        borderRadius: ['50%', '20%', '50% 0% 50% 50%', '50%'],
        rotate: [0, 90, 180, 360],
        scale: [1, 0.9, 1.1, 1],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: s,
        height: s,
        background: 'linear-gradient(135deg, #047857, #0d9488, #D97706)',
      }}
    />
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
