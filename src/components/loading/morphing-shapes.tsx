'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { box: number; hand: number }> = {
  sm: { box: 28, hand: 10 },
  md: { box: 56, hand: 20 },
  lg: { box: 80, hand: 28 },
  full: { box: 120, hand: 40 },
}

// Simple hand silhouette paths (left and right, facing each other)
// Left hand: palm facing right
const leftHandPath = 'M2 18 C2 14 6 10 8 10 L8 4 C8 2 10 2 10 4 L10 10 L12 3 C12 1 14 1 14 3 L14 10 L16 5 C16 3 18 3 18 5 L18 12 C18 18 14 22 8 22 C4 22 2 20 2 18 Z'
// Right hand: palm facing left (mirrored)
const rightHandPath = 'M38 18 C38 14 34 10 32 10 L32 4 C32 2 30 2 30 4 L30 10 L28 3 C28 1 26 1 26 3 L26 10 L24 5 C24 3 22 3 22 5 L22 12 C22 18 26 22 32 22 C36 22 38 20 38 18 Z'

export function MorphingShapes({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <svg width={cfg.box} height={cfg.box} viewBox="0 0 40 28" fill="none">
      {/* Left hand slides in from left */}
      <motion.path
        d={leftHandPath}
        fill="#047857"
        initial={{ x: -12, opacity: 0.5 }}
        animate={{
          x: [-12, 0, 0, -12],
          opacity: [0.5, 1, 1, 0.5],
        }}
        transition={{
          duration: 2.4,
          times: [0, 0.35, 0.7, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Right hand slides in from right */}
      <motion.path
        d={rightHandPath}
        fill="#0d9488"
        initial={{ x: 12, opacity: 0.5 }}
        animate={{
          x: [12, 0, 0, 12],
          opacity: [0.5, 1, 1, 0.5],
        }}
        transition={{
          duration: 2.4,
          times: [0, 0.35, 0.7, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Connection glow at center when hands meet */}
      <motion.circle
        cx="20"
        cy="14"
        r="4"
        fill="#D97706"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 0, 0.6, 0.6, 0],
          scale: [0, 0, 1, 1.2, 0],
        }}
        transition={{
          duration: 2.4,
          times: [0, 0.3, 0.45, 0.65, 0.85],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '20px 14px' }}
      />
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
