'use client'

import { ShieldCheck, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  idVerified: boolean
  criminalCheckClear: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function VerificationBadge({
  idVerified,
  criminalCheckClear,
  size = 'md',
  showLabel = true,
}: VerificationBadgeProps) {
  const fullyVerified = idVerified && criminalCheckClear
  const partiallyVerified = idVerified && !criminalCheckClear
  const unverified = !idVerified && !criminalCheckClear

  const sizeClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  if (unverified) {
    return (
      <span className={cn('inline-flex items-center', sizeClasses[size])}>
        <Shield className={cn(iconSizes[size], 'text-gray-400')} />
        {showLabel && <span className={cn(textSizes[size], 'text-gray-500 font-medium')}>Unverified</span>}
      </span>
    )
  }

  if (fullyVerified) {
    return (
      <span className={cn('inline-flex items-center', sizeClasses[size])}>
        <ShieldCheck className={cn(iconSizes[size], 'text-amber-500')} />
        {showLabel && <span className={cn(textSizes[size], 'text-amber-700 font-semibold')}>Fully Verified</span>}
      </span>
    )
  }

  if (partiallyVerified) {
    return (
      <span className={cn('inline-flex items-center', sizeClasses[size])}>
        <ShieldCheck className={cn(iconSizes[size], 'text-emerald-500')} />
        {showLabel && <span className={cn(textSizes[size], 'text-emerald-700 font-medium')}>ID Verified</span>}
      </span>
    )
  }

  return null
}
