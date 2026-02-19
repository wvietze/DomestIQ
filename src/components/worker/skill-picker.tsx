'use client'

import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SERVICE_TYPES } from '@/lib/utils/constants'

interface SkillPickerProps {
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

const SERVICE_EMOJIS: Record<string, string> = {
  'domestic-worker': '🏠', gardener: '🌿', painter: '🎨', welder: '🔧',
  electrician: '⚡', plumber: '🔧', carpenter: '🪚', tiler: '🧱',
  roofer: '🏗️', 'pool-cleaner': '🏊', 'pest-control': '🐛',
  'window-cleaner': '✨', handyman: '🛠️', babysitter: '👶',
  'dog-walker': '🐕', 'security-guard': '🛡️',
}

export function SkillPicker({ selected, onChange, className }: SkillPickerProps) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {SERVICE_TYPES.map(svc => {
        const isSelected = selected.includes(svc.id)
        return (
          <button key={svc.id} type="button" onClick={() => toggle(svc.id)}
            className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
              isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300')}>
            <span className="text-xl">{SERVICE_EMOJIS[svc.id] || '🛠️'}</span>
            <span className="font-medium text-sm flex-1">{svc.name}</span>
            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
          </button>
        )
      })}
      {selected.length > 0 && (
        <div className="col-span-2 flex flex-wrap gap-1.5">
          {selected.map(id => { const svc = SERVICE_TYPES.find(s => s.id === id); return svc ? <Badge key={id} variant="default" className="gap-1">{svc.name}<button onClick={() => toggle(id)} className="ml-1 hover:text-primary-foreground/80">×</button></Badge> : null })}
        </div>
      )}
    </div>
  )
}
