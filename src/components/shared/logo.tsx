'use client'

import Link from 'next/link'
import { HandHeart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'default' | 'large'
  light?: boolean
  href?: string
  className?: string
}

const sizeConfig = {
  sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-lg' },
  default: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-xl' },
  large: { box: 'w-11 h-11', icon: 'w-6 h-6', text: 'text-2xl' },
}

function LogoMark({ size = 'default', light = false, className }: Omit<LogoProps, 'href'>) {
  const { box, icon, text } = sizeConfig[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn(box, 'rounded-xl bg-gradient-to-br from-amber-500 via-emerald-600 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative overflow-hidden')}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <HandHeart className={cn(icon, 'text-white relative z-10')} />
      </div>
      <span className={cn(text, 'font-extrabold tracking-tight', light ? 'text-white' : 'text-foreground')}>
        Domest<span className="text-emerald-600">IQ</span>
      </span>
    </div>
  )
}

export function Logo({ size = 'default', light = false, href, className }: LogoProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex">
        <LogoMark size={size} light={light} className={className} />
      </Link>
    )
  }
  return <LogoMark size={size} light={light} className={className} />
}
