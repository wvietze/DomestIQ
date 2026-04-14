'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { RELATIONSHIP_LABELS, type ReferenceRelationship } from '@/lib/types/reference'

interface ReferenceCardProps {
  reference: {
    id: string
    reference_text: string
    relationship: ReferenceRelationship
    duration_months: number | null
    created_at: string
    client?: { full_name: string; avatar_url?: string | null }
    client_name?: string
  }
  className?: string
}

export function ReferenceCard({ reference, className }: ReferenceCardProps) {
  const date = new Date(reference.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
  const name = reference.client?.full_name || reference.client_name || 'Client'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
  const duration = reference.duration_months
    ? reference.duration_months >= 12
      ? `${Math.floor(reference.duration_months / 12)}+ year${Math.floor(reference.duration_months / 12) > 1 ? 's' : ''}`
      : `${reference.duration_months} month${reference.duration_months > 1 ? 's' : ''}`
    : null

  return (
    <Card className={cn('relative overflow-hidden bg-white', className)}>
      <CardContent className="p-5">
        <span className="material-symbols-outlined text-3xl text-[#9ffdd3] absolute top-4 right-4">format_quote</span>
        <p className="text-sm text-[#1a1c1b] leading-relaxed italic relative z-10">
          &ldquo;{reference.reference_text}&rdquo;
        </p>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#e8e8e6]">
          <Avatar className="w-8 h-8">
            <AvatarImage src={reference.client?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-[#9ffdd3] text-[#005d42]">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[#1a1c1b]">{name}</p>
            <div className="flex items-center gap-2 text-xs text-[#3e4943]">
              <span>{RELATIONSHIP_LABELS[reference.relationship]}</span>
              {duration && <><span>&middot;</span><span>{duration}</span></>}
              <span>&middot;</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
