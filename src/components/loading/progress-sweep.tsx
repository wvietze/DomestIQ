'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { s: number; stroke: number }> = {
  sm: { s: 24, stroke: 2 },
  md: { s: 48, stroke: 2.5 },
  lg: { s: 80, stroke: 3 },
  full: { s: 120, stroke: 3.5 },
}

export function ProgressSweep({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const cx = cfg.s / 2
  const horizonY = cfg.s * 0.62
  const arcR = cfg.s * 0.28
  const rayLen = cfg.s * 0.09
  const isSmall = size === 'sm'

  // Semicircle arc path above horizon
  const arcPath = `M ${cx - arcR} ${horizonY} A ${arcR} ${arcR} 0 0 1 ${cx + arcR} ${horizonY}`
  const arcLength = Math.PI * arcR

  // Sun rays fanning out
  const rayCount = isSmall ? 3 : 7
  const rays = Array.from({ length: rayCount }).map((_, i) => {
    const angle = Math.PI - (i / (rayCount - 1)) * Math.PI
    const inner = arcR + cfg.stroke * 2.5
    const outer = inner + rayLen
    return {
      x1: cx + Math.cos(angle) * inner,
      y1: horizonY - Math.sin(angle) * inner,
      x2: cx + Math.cos(angle) * outer,
      y2: horizonY - Math.sin(angle) * outer,
    }
  })

  // Rolling hills below horizon
  const hillPath = isSmall ? '' :
    `M ${cx - arcR - rayLen * 1.5} ${horizonY + cfg.stroke * 2}
     Q ${cx - arcR * 0.5} ${horizonY + cfg.stroke * 5} ${cx} ${horizonY + cfg.stroke * 3}
     Q ${cx + arcR * 0.5} ${horizonY + cfg.stroke * 1} ${cx + arcR + rayLen * 1.5} ${horizonY + cfg.stroke * 3}`

  const cycleDuration = 2.8

  const content = (
    <svg width={cfg.s} height={cfg.s} viewBox={`0 0 ${cfg.s} ${cfg.s}`} fill="none">
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#D97706" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm glow behind the sun */}
      {!isSmall && (
        <motion.circle
          cx={cx}
          cy={horizonY}
          r={arcR * 0.8}
          fill="url(#sun-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.8, 1, 0] }}
          transition={{
            duration: cycleDuration,
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Emerald horizon line */}
      <motion.line
        x1={cx - arcR - rayLen * 1.5}
        y1={horizonY}
        x2={cx + arcR + rayLen * 1.5}
        y2={horizonY}
        stroke="#047857"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{
          duration: cycleDuration,
          times: [0, 0.15, 0.85, 1],
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* Rolling hills */}
      {!isSmall && hillPath && (
        <motion.path
          d={hillPath}
          stroke="#059669"
          strokeWidth={Math.max(1, cfg.stroke * 0.5)}
          strokeLinecap="round"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.3, 0.3, 0] }}
          transition={{
            duration: cycleDuration,
            times: [0, 0.15, 0.35, 0.85, 1],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Amber sunrise arc — draws upward */}
      <motion.path
        d={arcPath}
        stroke="#D97706"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 1, 0],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: cycleDuration,
          times: [0.1, 0.45, 0.8, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Sun rays — stagger outward from center */}
      {rays.map((ray, i) => {
        // Center ray appears first, outer rays last
        const distFromCenter = Math.abs(i - (rayCount - 1) / 2) / ((rayCount - 1) / 2)
        const rayDelay = 0.4 + distFromCenter * 0.15
        return (
          <motion.line
            key={i}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke="#D97706"
            strokeWidth={Math.max(1, cfg.stroke * 0.6)}
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{
              opacity: [0, 0, 0.8, 0.8, 0],
              pathLength: [0, 0, 1, 1, 0],
            }}
            transition={{
              duration: cycleDuration,
              times: [0, rayDelay, rayDelay + 0.08, 0.8, 1],
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
