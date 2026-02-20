'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'default' | 'large'
  light?: boolean
  href?: string
  className?: string
}

const sizeConfig = {
  sm: { box: 32, text: 'text-lg' },
  default: { box: 36, text: 'text-xl' },
  large: { box: 44, text: 'text-2xl' },
}

function LogoMark({ size = 'default', light = false, className }: Omit<LogoProps, 'href'>) {
  const { box, text } = sizeConfig[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/icons/icon-512x512.png"
        alt="DomestIQ"
        width={box}
        height={box}
        className="rounded-lg"
        priority
      />
      <span className={cn(text, 'font-extrabold tracking-tight', light ? 'text-white' : 'text-foreground')}>
        domest<span className="text-emerald-600">IQ</span>
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
