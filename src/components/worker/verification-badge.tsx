'use client'

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
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  if (unverified) {
    return (
      <span className={cn('inline-flex items-center', sizeClasses[size])}>
        <span className={cn('material-symbols-outlined text-[#6e7a73]', iconSizes[size])}>shield</span>
        {showLabel && <span className={cn(textSizes[size], 'text-[#6e7a73] font-medium')}>Unverified</span>}
      </span>
    )
  }

  if (fullyVerified) {
    return (
      <span className={cn('inline-flex items-center', sizeClasses[size])}>
        <span className={cn('material-symbols-outlined text-[#fe932c]', iconSizes[size])}>verified_user</span>
        {showLabel && <span className={cn(textSizes[size], 'text-[#904d00] font-semibold')}>Fully Verified</span>}
      </span>
    )
  }

  if (partiallyVerified) {
    return (
      <span className={cn('inline-flex items-center', sizeClasses[size])}>
        <span className={cn('material-symbols-outlined text-[#005d42]', iconSizes[size])}>verified_user</span>
        {showLabel && <span className={cn(textSizes[size], 'text-[#005d42] font-medium')}>ID Verified</span>}
      </span>
    )
  }

  return null
}
