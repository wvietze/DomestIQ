'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Phone, User, Camera, Briefcase, Calendar, MapPin,
  FileText, ShieldCheck, ArrowRight, ArrowLeft, Check, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SERVICE_TYPES } from '@/lib/utils/constants'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'name', label: 'Name', icon: User },
  { id: 'services', label: 'Skills', icon: Briefcase },
  { id: 'availability', label: 'Days', icon: Calendar },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'documents', label: 'Docs', icon: FileText },
  { id: 'consent', label: 'Done', icon: ShieldCheck },
]

const DAYS = [
  { short: 'Mon', idx: 1 }, { short: 'Tue', idx: 2 }, { short: 'Wed', idx: 3 },
  { short: 'Thu', idx: 4 }, { short: 'Fri', idx: 5 }, { short: 'Sat', idx: 6 }, { short: 'Sun', idx: 0 },
]

const SA_CITIES = [
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'Nelspruit', 'Polokwane', 'Kimberley', 'East London',
  'Pietermaritzburg', 'Rustenburg', 'Soweto', 'Sandton', 'Centurion',
  'Midrand', 'Benoni', 'Boksburg', 'Roodepoort', 'Randburg',
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
  const [formData, setFormData] = useState({
    phone: '', fullName: '', avatarUrl: '',
    selectedServices: [] as string[], availableDays: [] as number[],
    city: '', bio: '', agreeTerms: false, agreePrivacy: false,
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

  const canProceed = () => {
    switch (step) {
      case 0: return formData.phone.length >= 10
      case 1: return formData.fullName.length >= 2
      case 2: return formData.selectedServices.length > 0
      case 3: return formData.availableDays.length > 0
      case 4: return formData.city.length > 0
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
      await supabase.from('worker_profiles').upsert({ user_id: user.id, bio: formData.bio || null, is_active: true })
      router.push('/worker-dashboard')
    } catch { setLoading(false) }
  }

  const next = () => { if (step === STEPS.length - 1) handleSubmit(); else setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  const back = () => setStep(s => Math.max(s - 1, 0))

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className={cn('h-2.5 rounded-full transition-all duration-300', i === step ? 'w-8 bg-primary' : i < step ? 'w-2.5 bg-primary/60' : 'w-2.5 bg-gray-200')} />
        ))}
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {/* Step 0: Phone */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><Phone className="w-8 h-8 text-primary" /></div>
                <h2 className="text-xl font-bold">Your Phone Number</h2>
                <p className="text-sm text-muted-foreground">We&apos;ll send you a verification code</p>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="072 123 4567" value={formData.phone} onChange={e => updateField('phone', e.target.value)} className="h-14 text-lg mt-1" />
              </div>
            </div>
          )}

          {/* Step 1: Name & Photo */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><User className="w-8 h-8 text-primary" /></div>
                <h2 className="text-xl font-bold">Your Name</h2>
                <p className="text-sm text-muted-foreground">How clients will see you</p>
              </div>
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {formData.fullName ? formData.fullName[0].toUpperCase() : <Camera className="w-8 h-8 text-muted-foreground" />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} className="h-14 text-lg mt-1" />
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><Briefcase className="w-8 h-8 text-primary" /></div>
                <h2 className="text-xl font-bold">Your Skills</h2>
                <p className="text-sm text-muted-foreground">Tap all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_TYPES.map(svc => {
                  const isSelected = formData.selectedServices.includes(svc.id)
                  return (
                    <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                      className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left', isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300')}>
                      <span className="text-xl">{SERVICE_EMOJIS[svc.id] || '🛠️'}</span>
                      <span className="font-medium text-sm">{svc.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  )
                })}
              </div>
              {formData.selectedServices.length > 0 && <p className="text-sm text-center text-muted-foreground">{formData.selectedServices.length} selected</p>}
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><Calendar className="w-8 h-8 text-primary" /></div>
                <h2 className="text-xl font-bold">Your Available Days</h2>
                <p className="text-sm text-muted-foreground">Tap the days you can work</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {DAYS.map(day => (
                  <button key={day.idx} type="button" onClick={() => toggleDay(day.idx)}
                    className={cn('flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[72px]', formData.availableDays.includes(day.idx) ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-gray-200 hover:border-gray-300')}>
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
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><MapPin className="w-8 h-8 text-primary" /></div>
                <h2 className="text-xl font-bold">Your Area</h2>
                <p className="text-sm text-muted-foreground">Where do you work?</p>
              </div>
              <Button variant="outline" className="w-full h-14 text-base" onClick={() => navigator.geolocation.getCurrentPosition(() => updateField('city', 'Location detected'), () => {}, { enableHighAccuracy: true })}>
                <MapPin className="w-5 h-5 mr-2" /> Detect My Location
              </Button>
              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or select a city</span></div></div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {SA_CITIES.map(city => (
                  <button key={city} type="button" onClick={() => updateField('city', city)}
                    className={cn('p-3 rounded-xl border text-sm font-medium transition-all text-left', formData.city === city ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300')}>{city}</button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Documents (optional) */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><FileText className="w-8 h-8 text-primary" /></div>
                <h2 className="text-xl font-bold">Documents</h2>
                <p className="text-sm text-muted-foreground">Optional - adds trust badges to your profile</p>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm font-medium">SA ID Document</p><p className="text-xs text-muted-foreground">Take a photo or upload</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <ShieldCheck className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm font-medium">Police Clearance</p><p className="text-xs text-muted-foreground">Adds &quot;Criminal Record Clear&quot; badge</p>
                </div>
              </div>
              <Textarea placeholder="Tell clients about yourself (optional)..." value={formData.bio} onChange={e => updateField('bio', e.target.value)} rows={3} className="text-base" />
            </div>
          )}

          {/* Step 6: Consent */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3"><ShieldCheck className="w-8 h-8 text-emerald-600" /></div>
                <h2 className="text-xl font-bold">Almost Done!</h2>
                <p className="text-sm text-muted-foreground">Please agree to continue</p>
              </div>
              <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={formData.agreeTerms} onChange={e => updateField('agreeTerms', e.target.checked)} className="mt-1 w-5 h-5 rounded" />
                <span className="text-sm">I agree to the <a href="/terms" className="text-primary underline" target="_blank">Terms of Service</a></span>
              </label>
              <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={formData.agreePrivacy} onChange={e => updateField('agreePrivacy', e.target.checked)} className="mt-1 w-5 h-5 rounded" />
                <span className="text-sm">I consent to DomestIQ processing my data as described in the <a href="/privacy" className="text-primary underline" target="_blank">Privacy Policy</a> (POPI Act)</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && <Button variant="outline" className="h-12 px-6" onClick={back}><ArrowLeft className="w-5 h-5 mr-1" /> Back</Button>}
        <Button className="flex-1 h-12 text-base" disabled={!canProceed() || loading} onClick={next}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === STEPS.length - 1 ? 'Complete Registration' : <>Next <ArrowRight className="w-5 h-5 ml-1" /></>}
        </Button>
      </div>
    </div>
  )
}
