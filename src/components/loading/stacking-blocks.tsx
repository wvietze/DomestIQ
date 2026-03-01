'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { box: number; avatarR: number; lineW: number; lineH: number; starR: number; gap: number }> = {
  sm: { box: 24, avatarR: 4, lineW: 14, lineH: 2, starR: 1.5, gap: 2 },
  md: { box: 48, avatarR: 8, lineW: 28, lineH: 3, starR: 2.5, gap: 3 },
  lg: { box: 80, avatarR: 12, lineW: 44, lineH: 4, starR: 3.5, gap: 5 },
  full: { box: 120, avatarR: 16, lineW: 64, lineH: 5, starR: 4.5, gap: 6 },
}

export function StackingBlocks({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const totalH = cfg.avatarR * 2 + cfg.gap + cfg.lineH + cfg.gap + cfg.starR * 2
  const cx = cfg.box / 2

  const content = (
    <svg width={cfg.box} height={cfg.box} viewBox={`0 0 ${cfg.box} ${cfg.box}`} fill="none">
      {/* Card background */}
      <motion.rect
        x={cx - cfg.lineW / 2 - cfg.gap}
        y={cfg.box / 2 - totalH / 2 - cfg.gap}
        width={cfg.lineW + cfg.gap * 2}
        height={totalH + cfg.gap * 2}
        rx={cfg.gap * 1.5}
        fill="#f0fdf4"
        stroke="#047857"
        strokeWidth={size === 'sm' ? 0.5 : 1}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0.4, 0] }}
        transition={{
          duration: 2.8,
          times: [0, 0.2, 0.8, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Avatar circle - drops in first */}
      <motion.circle
        cx={cx}
        cy={cfg.box / 2 - totalH / 2 + cfg.avatarR}
        r={cfg.avatarR}
        fill="#047857"
        initial={{ y: -cfg.avatarR * 2, opacity: 0 }}
        animate={{
          y: [-cfg.avatarR * 2, 0, 0, -cfg.avatarR * 2],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2.8,
          times: [0, 0.15, 0.8, 1],
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* Name line - slides in second */}
      <motion.rect
        x={cx - cfg.lineW / 2}
        y={cfg.box / 2 - totalH / 2 + cfg.avatarR * 2 + cfg.gap}
        width={cfg.lineW}
        height={cfg.lineH}
        rx={cfg.lineH / 2}
        fill="#0d9488"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: [0, 1, 1, 0],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2.8,
          times: [0.1, 0.3, 0.8, 1],
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: `${cx}px ${cfg.box / 2 - totalH / 2 + cfg.avatarR * 2 + cfg.gap + cfg.lineH / 2}px` }}
      />

      {/* 3 star dots - fade in third */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={cx - (cfg.starR * 3) + i * (cfg.starR * 3)}
          cy={cfg.box / 2 - totalH / 2 + cfg.avatarR * 2 + cfg.gap + cfg.lineH + cfg.gap + cfg.starR}
          r={cfg.starR}
          fill="#D97706"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0, 1, 1, 0],
            scale: [0, 0, 1, 1, 0],
          }}
          transition={{
            duration: 2.8,
            times: [0, 0.35 + i * 0.05, 0.45 + i * 0.05, 0.8, 1],
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{ transformOrigin: `${cx - (cfg.starR * 3) + i * (cfg.starR * 3)}px ${cfg.box / 2 - totalH / 2 + cfg.avatarR * 2 + cfg.gap + cfg.lineH + cfg.gap + cfg.starR}px` }}
        />
      ))}
    </svg>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className="flex items-center justify-center">{content}</div>
}
