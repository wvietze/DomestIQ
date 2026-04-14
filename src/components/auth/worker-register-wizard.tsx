'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { WaveBars } from '@/components/loading'
import { SERVICE_TYPES } from '@/lib/utils/constants'
import { createClient } from '@/lib/supabase/client'
import { SA_CITIES, type SACity } from '@/lib/data/sa-cities'
import { CitySelector } from '@/components/worker/city-selector'
import { reverseGeocode } from '@/lib/maps/geocoding'

const STEPS = [
  { id: 'phone', label: 'Phone' },
  { id: 'name', label: 'Name' },
  { id: 'services', label: 'Skills' },
  { id: 'availability', label: 'Days' },
  { id: 'location', label: 'Location' },
  { id: 'documents', label: 'Docs' },
  { id: 'consent', label: 'Done' },
]

const DAYS = [
  { short: 'Mon', idx: 1 }, { short: 'Tue', idx: 2 }, { short: 'Wed', idx: 3 },
  { short: 'Thu', idx: 4 }, { short: 'Fri', idx: 5 }, { short: 'Sat', idx: 6 }, { short: 'Sun', idx: 0 },
]

const SERVICE_EMOJIS: Record<string, string> = {
  'domestic-worker': '🏠', gardener: '🌿', painter: '🎨', welder: '🔧',
  electrician: '⚡', plumber: '🔧', carpenter: '🪚', tiler: '🧱',
  roofer: '🏗️', 'pool-cleaner': '🏊', 'pest-control': '🐛',
  'window-cleaner': '✨', handyman: '🛠️', babysitter: '👶',
  'dog-walker': '🐕', 'security-guard': '🛡️',
}

export function WorkerRegisterWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [locationName, setLocationName] = useState('')
  const [locationDetecting, setLocationDetecting] = useState(false)
  const [formData, setFormData] = useState({
    phone: '', fullName: '', avatarUrl: '',
    selectedServices: [] as string[], availableDays: [] as number[],
    selectedCities: [] as string[], bio: '', agreeTerms: false, agreePrivacy: false,
  })

  const updateField = useCallback(<K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleService = (id: string) => setFormData(prev => ({
    ...prev, selectedServices: prev.selectedServices.includes(id) ? prev.selectedServices.filter(s => s !== id) : [...prev.selectedServices, id]
  }))

  const toggleDay = (idx: number) => setFormData(prev => ({
    ...prev, availableDays: prev.availableDays.includes(idx) ? prev.availableDays.filter(d => d !== idx) : [...prev.availableDays, idx]
  }))

  const toggleCitySelection = (city: SACity) => setFormData(prev => ({
    ...prev, selectedCities: prev.selectedCities.includes(city.name)
      ? prev.selectedCities.filter(c => c !== city.name)
      : prev.selectedCities.length < 10 ? [...prev.selectedCities, city.name] : prev.selectedCities
  }))

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setLocationDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocationLat(lat)
        setLocationLng(lng)
        try {
          const result = await reverseGeocode(lat, lng)
          if (result) {
            setLocationName([result.suburb, result.city].filter(Boolean).join(', ') || result.formattedAddress)
          } else {
            setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
          }
        } catch {
          setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        }
        setLocationDetecting(false)
      },
      () => setLocationDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const canProceed = () => {
    switch (step) {
      case 0: return formData.phone.length >= 10
      case 1: return formData.fullName.length >= 2
      case 2: return formData.selectedServices.length > 0
      case 3: return formData.availableDays.length > 0
      case 4: return formData.selectedCities.length > 0 || locationLat !== null
      case 5: return true
      case 6: return formData.agreeTerms && formData.agreePrivacy
      default: return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await supabase.from('profiles').upsert({ id: user.id, full_name: formData.fullName, phone: formData.phone, role: 'worker', preferred_language: 'en', popi_consent: true, avatar_url: formData.avatarUrl || null })
      const { data: wp } = await supabase.from('worker_profiles').upsert({
        user_id: user.id, bio: formData.bio || null, is_active: true,
        location_lat: locationLat, location_lng: locationLng, location_name: locationName || null,
      }).select('id').single()

      if (wp && formData.selectedCities.length > 0) {
        const areaRecords = formData.selectedCities.map(cityName => {
          const cityData = SA_CITIES.find(c => c.name === cityName)
          return cityData ? {
            worker_id: wp.id, area_name: cityData.name,
            center_lat: cityData.lat, center_lng: cityData.lng, radius_km: 25,
          } : null
        }).filter(Boolean)
        if (areaRecords.length > 0) {
          await supabase.from('worker_service_areas').insert(areaRecords)
        }
      }
      router.push('/worker-dashboard')
    } catch { setLoading(false) }
  }

  const next = () => { if (step === STEPS.length - 1) handleSubmit(); else setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  const back = () => setStep(s => Math.max(s - 1, 0))

  const STEP_ICONS = ['phone', 'person', 'work', 'calendar_today', 'location_on', 'description', 'shield']

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className={cn('h-2.5 rounded-full transition-all duration-300', i === step ? 'w-8 bg-[#005d42]' : i < step ? 'w-2.5 bg-[#005d42]/60' : 'w-2.5 bg-[#e2e3e1]')} />
        ))}
      </div>

      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="p-6">
          {/* Step 0: Phone */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#9ffdd3] flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-3xl text-[#005d42]">{STEP_ICONS[0]}</span></div>
                <h2 className="text-xl font-bold text-[#1a1c1b]">Your Phone Number</h2>
                <p className="text-sm text-[#3e4943]">We&apos;ll send you a verification code</p>
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#1a1c1b]">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="072 123 4567" value={formData.phone} onChange={e => updateField('phone', e.target.value)} className="h-14 text-lg mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
              </div>
            </div>
          )}

          {/* Step 1: Name & Photo */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#9ffdd3] flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-3xl text-[#005d42]">{STEP_ICONS[1]}</span></div>
                <h2 className="text-xl font-bold text-[#1a1c1b]">Your Name</h2>
                <p className="text-sm text-[#3e4943]">How clients will see you</p>
              </div>
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-[#9ffdd3] text-[#005d42]">
                    {formData.fullName ? formData.fullName[0].toUpperCase() : <span className="material-symbols-outlined text-3xl text-[#3e4943]">photo_camera</span>}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <Label htmlFor="name" className="text-[#1a1c1b]">Full Name</Label>
                <Input id="name" placeholder="Your full name" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} className="h-14 text-lg mt-1 bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#9ffdd3] flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-3xl text-[#005d42]">{STEP_ICONS[2]}</span></div>
                <h2 className="text-xl font-bold text-[#1a1c1b]">Your Skills</h2>
                <p className="text-sm text-[#3e4943]">Tap all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_TYPES.map(svc => {
                  const isSelected = formData.selectedServices.includes(svc.id)
                  return (
                    <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                      className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left', isSelected ? 'border-[#005d42] bg-[#9ffdd3]/30 shadow-sm' : 'border-[#bdc9c1] hover:border-[#97f5cc]')}>
                      <span className="text-xl">{SERVICE_EMOJIS[svc.id] || '🛠️'}</span>
                      <span className="font-medium text-sm text-[#1a1c1b]">{svc.name}</span>
                      {isSelected && <span className="material-symbols-outlined text-base text-[#005d42] ml-auto">check</span>}
                    </button>
                  )
                })}
              </div>
              {formData.selectedServices.length > 0 && <p className="text-sm text-center text-[#3e4943]">{formData.selectedServices.length} selected</p>}
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#9ffdd3] flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-3xl text-[#005d42]">{STEP_ICONS[3]}</span></div>
                <h2 className="text-xl font-bold text-[#1a1c1b]">Your Available Days</h2>
                <p className="text-sm text-[#3e4943]">Tap the days you can work</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {DAYS.map(day => (
                  <button key={day.idx} type="button" onClick={() => toggleDay(day.idx)}
                    className={cn('flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[72px]', formData.availableDays.includes(day.idx) ? 'border-[#005d42] bg-[#005d42] text-white shadow-sm' : 'border-[#bdc9c1] text-[#1a1c1b] hover:border-[#97f5cc]')}>
                    <span className="text-lg font-bold">{day.short}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#9ffdd3] flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-3xl text-[#005d42]">{STEP_ICONS[4]}</span></div>
                <h2 className="text-xl font-bold text-[#1a1c1b]">Your Work Areas</h2>
                <p className="text-sm text-[#3e4943]">Select cities or detect your location</p>
              </div>

              <Button variant="outline" className="w-full h-12 text-base gap-2 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]" onClick={detectLocation} disabled={locationDetecting}>
                <span className={`material-symbols-outlined text-base ${locationDetecting ? 'animate-spin' : ''}`}>
                  {locationDetecting ? 'progress_activity' : 'my_location'}
                </span>
                {locationLat ? 'Re-detect Location' : 'Detect My Location'}
              </Button>
              {locationLat && locationName && (
                <div className="rounded-lg bg-[#9ffdd3]/30 border border-[#97f5cc] p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#005d42] shrink-0">check_circle</span>
                  <p className="text-sm font-medium text-[#005d42]">{locationName}</p>
                </div>
              )}

              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e8e8e6]" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-[#3e4943]">select your cities</span></div></div>

              <CitySelector
                selectedCities={formData.selectedCities}
                onToggleCity={toggleCitySelection}
                maxCities={10}
              />
            </div>
          )}

          {/* Step 5: Documents (optional) */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#9ffdd3] flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-3xl text-[#005d42]">{STEP_ICONS[5]}</span></div>
                <h2 className="text-xl font-bold text-[#1a1c1b]">Documents</h2>
                <p className="text-sm text-[#3e4943]">Optional - adds trust badges to your profile</p>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border-2 border-dashed border-[#bdc9c1] text-center">
                  <span className="material-symbols-outlined text-3xl text-[#3e4943] block mb-2">photo_camera</span>
                  <p className="text-sm font-medium text-[#1a1c1b]">SA ID Document</p><p className="text-xs text-[#3e4943]">Take a photo or upload</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-dashed border-[#bdc9c1] text-center">
                  <span className="material-symbols-outlined text-3xl text-[#3e4943] block mb-2">verified_user</span>
                  <p className="text-sm font-medium text-[#1a1c1b]">Police Clearance</p><p className="text-xs text-[#3e4943]">Adds &quot;Criminal Record Clear&quot; badge</p>
                </div>
              </div>
              <Textarea placeholder="Tell clients about yourself (optional)..." value={formData.bio} onChange={e => updateField('bio', e.target.value)} rows={3} className="text-base bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
            </div>
          )}

          {/* Step 6: Consent */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#9ffdd3] flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-3xl text-[#005d42]">{STEP_ICONS[6]}</span></div>
                <h2 className="text-xl font-bold text-[#1a1c1b]">Almost Done!</h2>
                <p className="text-sm text-[#3e4943]">Please agree to continue</p>
              </div>
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[#bdc9c1] cursor-pointer hover:bg-[#f4f4f2] transition-colors">
                <input type="checkbox" checked={formData.agreeTerms} onChange={e => updateField('agreeTerms', e.target.checked)} className="mt-1 w-5 h-5 rounded accent-[#005d42]" />
                <span className="text-sm text-[#1a1c1b]">I agree to the <a href="/terms" className="text-[#005d42] underline" target="_blank">Terms of Service</a></span>
              </label>
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[#bdc9c1] cursor-pointer hover:bg-[#f4f4f2] transition-colors">
                <input type="checkbox" checked={formData.agreePrivacy} onChange={e => updateField('agreePrivacy', e.target.checked)} className="mt-1 w-5 h-5 rounded accent-[#005d42]" />
                <span className="text-sm text-[#1a1c1b]">I consent to DomestIQ processing my data as described in the <a href="/privacy" className="text-[#005d42] underline" target="_blank">Privacy Policy</a> (POPI Act)</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && <Button variant="outline" className="h-12 px-6 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]" onClick={back}><span className="material-symbols-outlined text-xl mr-1">arrow_back</span> Back</Button>}
        <Button className="flex-1 h-12 text-base bg-[#005d42] hover:bg-[#047857] text-white font-bold rounded-lg active:scale-[0.98] transition-all" disabled={!canProceed() || loading} onClick={next}>
          {loading ? <WaveBars size="sm" /> : step === STEPS.length - 1 ? 'Complete Registration' : <>Next <span className="material-symbols-outlined text-xl ml-1">arrow_forward</span></>}
        </Button>
      </div>
    </div>
  )
}
