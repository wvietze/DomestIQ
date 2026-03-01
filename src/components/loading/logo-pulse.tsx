'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeConfig: Record<Size, { container: string; logo: number; text: string }> = {
  sm: { container: 'h-8 w-8', logo: 20, text: 'hidden' },
  md: { container: 'h-16 w-16', logo: 36, text: 'text-xs' },
  lg: { container: 'h-24 w-24', logo: 56, text: 'text-sm' },
  full: { container: 'h-screen w-full', logo: 72, text: 'text-base' },
}

export function LogoPulse({ size = 'full' }: { size?: Size }) {
  const cfg = sizeConfig[size]
  const isInline = size === 'sm' || size === 'md'

  const content = (
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      className="flex flex-col items-center gap-2"
    >
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
      {!isInline && <span className={`font-semibold text-emerald-700 ${cfg.text}`}>Loading...</span>}
    </motion.div>
  )

  if (size === 'full') {
    return <div className="flex items-center justify-center h-screen w-full">{content}</div>
  }

  return <div className={`flex items-center justify-center ${cfg.container}`}>{content}</div>
}
