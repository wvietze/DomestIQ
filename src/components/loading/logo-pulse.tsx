'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { container: string; logo: number; glow: number; text: string }> = {
  sm: { container: 'h-8 w-8', logo: 20, glow: 28, text: 'hidden' },
  md: { container: 'h-16 w-16', logo: 36, glow: 50, text: 'text-xs' },
  lg: { container: 'h-24 w-24', logo: 56, glow: 76, text: 'text-sm' },
  full: { container: 'h-screen w-full', logo: 72, glow: 96, text: 'text-base' },
}

export function LogoPulse({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const isInline = size === 'sm' || size === 'md'
  const usePng = size === 'lg' || size === 'full'

  const content = (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Glow ring */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{
          width: cfg.glow,
          height: cfg.glow,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(4,120,87,0.25) 0%, rgba(13,148,136,0.1) 60%, transparent 80%)',
        }}
      />
      {/* Logo */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        {usePng ? (
          <Image
            src="/icons/icon-512x512.png"
            alt="DomestIQ"
            width={cfg.logo}
            height={cfg.logo}
            className="rounded-xl"
          />
        ) : (
          <svg width={cfg.logo} height={cfg.logo} viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="url(#lp-grad)" />
            <path d="M12 28V16l8-6 8 6v12H22v-6h-4v6z" fill="white" />
            <defs>
              <linearGradient id="lp-grad" x1="0" y1="0" x2="40" y2="40">
                <stop stopColor="#047857" />
                <stop offset="1" stopColor="#0d9488" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </motion.div>
      {!isInline && <span className={`font-semibold text-emerald-700 ${cfg.text} relative z-10`}>Loading...</span>}
    </div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full gradient-mesh bg-dots">{content}</div>
  }

  return <div className={`flex items-center justify-center ${cfg.container}`}>{content}</div>
}
