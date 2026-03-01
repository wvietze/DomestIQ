'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { s: number; stroke: number }> = {
  sm: { s: 24, stroke: 2 },
  md: { s: 48, stroke: 2.5 },
  lg: { s: 80, stroke: 3 },
  full: { s: 120, stroke: 3.5 },
}

// Shield path centered in a 40x40 viewBox
const shieldPath = 'M20 3 L34 10 C34 10 34 26 20 37 C6 26 6 10 6 10 Z'
const shieldLength = 100
// Checkmark inside shield
const checkPath = 'M13 20 L18 25 L27 15'
const checkLength = 22

export function GradientSpinner({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]

  const content = (
    <svg width={cfg.s} height={cfg.s} viewBox="0 0 40 40" fill="none">
      {/* Shield outline draws itself */}
      <motion.path
        d={shieldPath}
        stroke="#047857"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{
          duration: 2.4,
          times: [0, 0.4, 0.8, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Checkmark draws after shield */}
      <motion.path
        d={checkPath}
        stroke="#D97706"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 0, 1, 1, 0],
          opacity: [0, 0, 1, 1, 0],
        }}
        transition={{
          duration: 2.4,
          times: [0, 0.4, 0.65, 0.8, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Subtle green fill that fades in */}
      <motion.path
        d={shieldPath}
        fill="#047857"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.08, 0.08, 0] }}
        transition={{
          duration: 2.4,
          times: [0, 0.4, 0.65, 0.8, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
