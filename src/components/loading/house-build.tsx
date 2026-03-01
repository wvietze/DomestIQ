'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, number> = {
  sm: 24,
  md: 48,
  lg: 80,
  full: 120,
}

// SVG paths for the house parts (viewBox 0 0 40 40)
const roofPath = 'M20 4 L36 18 L4 18 Z' // triangle roof
const wallLeft = 'M8 18 L8 34 L19 34 L19 18'
const wallRight = 'M21 18 L21 34 L32 34 L32 18'
const doorPath = 'M15 34 L15 24 L25 24 L25 34' // door in center
// Heart inside the house (small, centered)
const heartPath = 'M20 29 C20 29 15 24 15 21.5 C15 19.5 17 18 19 19.5 L20 20.5 L21 19.5 C23 18 25 19.5 25 21.5 C25 24 20 29 20 29 Z'

const drawTransition = (delay: number, duration: number) => ({
  pathLength: { delay, duration, ease: 'easeInOut' as const },
  opacity: { delay, duration: 0.01 },
})

export function HouseBuild({ size = 'full' }: { size?: Size }) {
  const s = sizeConfig[size]

  const content = (
    <svg width={s} height={s} viewBox="0 0 40 38" fill="none">
      {/* Roof - amber */}
      <motion.path
        d={roofPath}
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          ...drawTransition(0, 0.6),
          repeat: Infinity,
          repeatDelay: 1.5,
          repeatType: 'loop',
        }}
      />
      {/* Left wall - emerald */}
      <motion.path
        d={wallLeft}
        stroke="#047857"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          ...drawTransition(0.5, 0.5),
          repeat: Infinity,
          repeatDelay: 1.6,
          repeatType: 'loop',
        }}
      />
      {/* Right wall - emerald */}
      <motion.path
        d={wallRight}
        stroke="#047857"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          ...drawTransition(0.5, 0.5),
          repeat: Infinity,
          repeatDelay: 1.6,
          repeatType: 'loop',
        }}
      />
      {/* Door - teal */}
      <motion.path
        d={doorPath}
        stroke="#0d9488"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          ...drawTransition(1.0, 0.4),
          repeat: Infinity,
          repeatDelay: 1.7,
          repeatType: 'loop',
        }}
      />
      {/* Heart inside - fades in last */}
      <motion.path
        d={heartPath}
        fill="#D97706"
        stroke="none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0, 0, 1, 1, 0] }}
        transition={{
          duration: 3.1,
          times: [0, 0.45, 0.55, 0.85, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '20px 25px' }}
      />
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center" style={{ width: s, height: s }}>{content}</div>
}
