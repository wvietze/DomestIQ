'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, {
  box: number; avatarR: number; nameW: number; subW: number;
  lineH: number; starSize: number; gap: number; cardPad: number
}> = {
  sm: { box: 28, avatarR: 4, nameW: 16, subW: 10, lineH: 2, starSize: 3, gap: 2, cardPad: 3 },
  md: { box: 56, avatarR: 8, nameW: 30, subW: 20, lineH: 3, starSize: 5, gap: 3, cardPad: 5 },
  lg: { box: 88, avatarR: 13, nameW: 48, subW: 32, lineH: 4, starSize: 7, gap: 5, cardPad: 8 },
  full: { box: 128, avatarR: 18, nameW: 68, subW: 44, lineH: 5, starSize: 9, gap: 7, cardPad: 10 },
}

// Small 5-point star path centered at origin
function starPath(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const innerAngle = ((i * 72) + 36 - 90) * (Math.PI / 180)
    pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`)
    pts.push(`${cx + Math.cos(innerAngle) * r * 0.4},${cy + Math.sin(innerAngle) * r * 0.4}`)
  }
  return `M${pts.join('L')}Z`
}

export function StackingBlocks({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const cx = cfg.box / 2
  const isSmall = size === 'sm'

  // Vertical layout positions
  const cardW = cfg.nameW + cfg.cardPad * 2
  const contentH = cfg.avatarR * 2 + cfg.gap + cfg.lineH + cfg.gap + cfg.lineH + cfg.gap + cfg.starSize * 2
  const cardH = contentH + cfg.cardPad * 2
  const cardTop = (cfg.box - cardH) / 2
  const avatarCy = cardTop + cfg.cardPad + cfg.avatarR
  const nameY = avatarCy + cfg.avatarR + cfg.gap
  const subY = nameY + cfg.lineH + cfg.gap
  const starY = subY + cfg.lineH + cfg.gap + cfg.starSize

  const cycleDuration = 3

  const content = (
    <svg width={cfg.box} height={cfg.box} viewBox={`0 0 ${cfg.box} ${cfg.box}`} fill="none">
      {/* Card background - fades in early */}
      <motion.rect
        x={(cfg.box - cardW) / 2}
        y={cardTop}
        width={cardW}
        height={cardH}
        rx={isSmall ? 3 : 6}
        fill="#f0fdf4"
        stroke="#047857"
        strokeWidth={isSmall ? 0.5 : 1}
        strokeOpacity={0.3}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.95] }}
        transition={{
          duration: cycleDuration,
          times: [0, 0.12, 0.82, 1],
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: `${cx}px ${cardTop + cardH / 2}px` }}
      />

      {/* Avatar circle — bounces in */}
      <motion.circle
        cx={cx}
        cy={avatarCy}
        r={cfg.avatarR}
        fill="#047857"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.15, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
        transition={{
          duration: cycleDuration,
          times: [0.05, 0.18, 0.22, 0.82, 1],
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: `${cx}px ${avatarCy}px` }}
      />

      {/* Name line — slides in from left */}
      <motion.rect
        x={cx - cfg.nameW / 2}
        y={nameY}
        width={cfg.nameW}
        height={cfg.lineH}
        rx={cfg.lineH / 2}
        fill="#0d9488"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: cycleDuration,
          times: [0.18, 0.32, 0.82, 1],
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: `${cx - cfg.nameW / 2}px ${nameY + cfg.lineH / 2}px` }}
      />

      {/* Subtitle line — slides in slightly later, shorter */}
      <motion.rect
        x={cx - cfg.subW / 2}
        y={subY}
        width={cfg.subW}
        height={cfg.lineH}
        rx={cfg.lineH / 2}
        fill="#0d9488"
        opacity={0.5}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.5, 0.5, 0] }}
        transition={{
          duration: cycleDuration,
          times: [0.25, 0.38, 0.82, 1],
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: `${cx - cfg.subW / 2}px ${subY + cfg.lineH / 2}px` }}
      />

      {/* 3 star ratings — pop in one by one */}
      {[0, 1, 2].map((i) => {
        const spacing = cfg.starSize * 2.5
        const starCx = cx - spacing + i * spacing
        return (
          <motion.path
            key={i}
            d={starPath(starCx, starY, cfg.starSize)}
            fill="#D97706"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 0, 1.3, 1, 1, 0],
              opacity: [0, 0, 1, 1, 1, 0],
            }}
            transition={{
              duration: cycleDuration,
              times: [0, 0.38 + i * 0.06, 0.44 + i * 0.06, 0.48 + i * 0.06, 0.82, 1],
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: `${starCx}px ${starY}px` }}
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
