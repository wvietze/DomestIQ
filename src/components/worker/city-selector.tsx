'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { getCitiesByProvinceAndMetro, SA_PROVINCES, type SACity } from '@/lib/data/sa-cities'
import { Search, ChevronRight, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CitySelectorProps {
 selectedCities: string[]
 onToggleCity: (city: SACity) => void
 maxCities?: number
}

export function CitySelector({
 selectedCities,
 onToggleCity,
 maxCities = 10,
}: CitySelectorProps) {
 const [searchQuery, setSearchQuery] = useState('')
 const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(
 () => new Set(['Western Cape']) // Auto-expand launch region
 )

 const hierarchy = useMemo(() => getCitiesByProvinceAndMetro(), [])

 const isSearching = searchQuery.trim().length > 0
 const q = searchQuery.toLowerCase().trim()

 // Filter and determine which provinces/metros match the search
 const filteredHierarchy = useMemo(() => {
 if (!isSearching) return hierarchy

 const result: Record<string, Record<string, SACity[]>> = {}
 for (const [province, metros] of Object.entries(hierarchy)) {
 const provinceMatches = province.toLowerCase().includes(q)
 const filteredMetros: Record<string, SACity[]> = {}

 for (const [metro, cities] of Object.entries(metros)) {
 const metroMatches = metro.toLowerCase().includes(q)
 const matchingCities = cities.filter(
 c => c.name.toLowerCase().includes(q) || provinceMatches || metroMatches
 )
 if (matchingCities.length > 0) {
 filteredMetros[metro] = matchingCities
 }
 }

 if (Object.keys(filteredMetros).length > 0) {
 result[province] = filteredMetros
 }
 }
 return result
 }, [hierarchy, q, isSearching])

 const toggleProvince = (province: string) => {
 setExpandedProvinces(prev => {
 const next = new Set(prev)
 if (next.has(province)) {
 next.delete(province)
 } else {
 next.add(province)
 }
 return next
 })
 }

 return (
 <div className="space-y-3">
 {/* Selected cities chips */}
 {selectedCities.length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {selectedCities.map(name => (
 <button
 key={name}
 onClick={() => {
 // Find the city object to pass to onToggleCity
 for (const metros of Object.values(hierarchy)) {
 for (const cities of Object.values(metros)) {
 const city = cities.find(c => c.name === name)
 if (city) { onToggleCity(city); return }
 }
 }
 }}
 className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
 >
 {name}
 <X className="w-3 h-3"/>
 </button>
 ))}
 <span className="text-xs text-muted-foreground self-center ml-1">
 {selectedCities.length}/{maxCities}
 </span>
 </div>
 )}

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
 <Input
 placeholder="Search cities, metros, or provinces..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="pl-9 h-10"
 />
 </div>

 {/* Accordion list */}
 <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
 {SA_PROVINCES.filter(p => p in filteredHierarchy).map(province => {
 const metros = filteredHierarchy[province]
 const isExpanded = expandedProvinces.has(province) || isSearching

 return (
 <div key={province}>
 {/* Province header */}
 <button
 type="button"
 onClick={() => toggleProvince(province)}
 className="flex items-center gap-1.5 w-full py-2 px-1 text-left group"
 >
 <ChevronRight
 className={cn(
 'w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0',
 isExpanded && 'rotate-90'
 )}
 />
 <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
 {province}
 </span>
 {/* Count of selected in this province */}
 {(() => {
 const count = Object.values(metros).flat().filter(c => selectedCities.includes(c.name)).length
 return count > 0 ? (
 <span className="ml-auto text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
 {count}
 </span>
 ) : null
 })()}
 </button>

 {/* Metro groups + cities */}
 {isExpanded && (
 <div className="ml-2 space-y-2 mb-2">
 {Object.entries(metros).map(([metro, cities]) => (
 <div key={metro}>
 <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 px-1">
 {metro}
 </p>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
 {cities.map(city => {
 const selected = selectedCities.includes(city.name)
 return (
 <button
 key={city.name}
 type="button"
 onClick={() => onToggleCity(city)}
 disabled={!selected && selectedCities.length >= maxCities}
 className={cn(
 'flex items-center gap-1.5 px-2.5 py-2 text-sm rounded-lg border transition-all text-left',
 selected
 ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
 : 'border-border hover:border-emerald-300',
 !selected && selectedCities.length >= maxCities && 'opacity-50 cursor-not-allowed'
 )}
 >
 {selected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0"/>}
 <span className="truncate">{city.name}</span>
 </button>
 )
 })}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )
 })}

 {Object.keys(filteredHierarchy).length === 0 && (
 <p className="text-sm text-muted-foreground text-center py-4">
 No cities found for &quot;{searchQuery}&quot;
 </p>
 )}
 </div>
 </div>
 )
}
