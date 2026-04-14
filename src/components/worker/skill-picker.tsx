'use client'

import { Badge } from '@/components/ui/badge'
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
              isSelected ? 'border-[#005d42] bg-[#9ffdd3]/30 shadow-sm' : 'border-[#e2e3e1] hover:border-[#bdc9c1]')}>
            <span className="text-xl">{SERVICE_EMOJIS[svc.id] || '🛠️'}</span>
            <span className="font-medium text-sm flex-1 text-[#1a1c1b]">{svc.name}</span>
            {isSelected && <span className="material-symbols-outlined text-base text-[#005d42] shrink-0">check</span>}
          </button>
        )
      })}
      {selected.length > 0 && (
        <div className="col-span-2 flex flex-wrap gap-1.5">
          {selected.map(id => { const svc = SERVICE_TYPES.find(s => s.id === id); return svc ? <Badge key={id} variant="default" className="gap-1 bg-[#005d42] text-white">{svc.name}<button onClick={() => toggle(id)} className="ml-1 hover:text-white/80">×</button></Badge> : null })}
        </div>
      )}
    </div>
  )
}
