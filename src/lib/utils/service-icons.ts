import {
  Home, Flower2, Paintbrush, Flame, Zap, Droplets,
  Hammer, Grid3X3, Warehouse, Waves, Bug, Sparkles,
  Wrench, Baby, Dog, ShieldCheck, HelpCircle,
  type LucideIcon
} from 'lucide-react'

const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  'domestic-worker': Home,
  'gardener': Flower2,
  'painter': Paintbrush,
  'welder': Flame,
  'electrician': Zap,
  'plumber': Droplets,
  'carpenter': Hammer,
  'tiler': Grid3X3,
  'roofer': Warehouse,
  'pool-cleaner': Waves,
  'pest-control': Bug,
  'window-cleaner': Sparkles,
  'handyman': Wrench,
  'babysitter': Baby,
  'dog-walker': Dog,
  'security': ShieldCheck,
}

export const SERVICE_OPTIONS = [
  { id: 'domestic-worker', name: 'Domestic Worker' },
  { id: 'gardener', name: 'Gardener' },
  { id: 'painter', name: 'Painter' },
  { id: 'welder', name: 'Welder' },
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'tiler', name: 'Tiler' },
  { id: 'roofer', name: 'Roofer' },
  { id: 'pool-cleaner', name: 'Pool Cleaner' },
  { id: 'pest-control', name: 'Pest Control' },
  { id: 'window-cleaner', name: 'Window Cleaner' },
  { id: 'handyman', name: 'Handyman' },
  { id: 'babysitter', name: 'Babysitter' },
  { id: 'dog-walker', name: 'Dog Walker' },
  { id: 'security', name: 'Security' },
] as const

/** Get the Lucide icon component for a service name or ID */
export function getServiceIcon(nameOrId: string): LucideIcon {
  // Try direct ID match first
  if (SERVICE_ICON_MAP[nameOrId]) return SERVICE_ICON_MAP[nameOrId]

  // Try matching by name (convert to kebab-case ID)
  const kebab = nameOrId.toLowerCase().replace(/\s+/g, '-')
  if (SERVICE_ICON_MAP[kebab]) return SERVICE_ICON_MAP[kebab]

  return HelpCircle
}

/** Get all service options with their icons */
export function getServiceOptionsWithIcons() {
  return SERVICE_OPTIONS.map(opt => ({
    ...opt,
    icon: SERVICE_ICON_MAP[opt.id] || HelpCircle,
  }))
}
