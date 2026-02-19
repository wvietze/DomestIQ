'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SERVICE_TYPES } from '@/lib/utils/constants'

interface SkillFilterChipsProps {
  selected: string | null
  onChange: (serviceId: string | null) => void
  className?: string
}

export function SkillFilterChips({ selected, onChange, className }: SkillFilterChipsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      <Badge variant={selected === null ? 'default' : 'outline'} className="cursor-pointer whitespace-nowrap shrink-0 px-3 py-1.5" onClick={() => onChange(null)}>All</Badge>
      {SERVICE_TYPES.map(svc => (
        <Badge key={svc.id} variant={selected === svc.id ? 'default' : 'outline'} className="cursor-pointer whitespace-nowrap shrink-0 px-3 py-1.5" onClick={() => onChange(selected === svc.id ? null : svc.id)}>{svc.name}</Badge>
      ))}
    </div>
  )
}
