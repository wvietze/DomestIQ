'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Camera, CheckCircle2, MapPin, FileText, Shield,
  ChevronLeft, ChevronRight, User, Loader2, UserPlus,
  Home, Flower2, Paintbrush, Flame, Zap, Droplets,
  Hammer, Grid3X3, Warehouse, Waves, Bug, Sparkles,
  Wrench, Baby, Dog, ShieldCheck, Phone, Copy, RefreshCw,
  IdCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SERVICE_OPTIONS = [
  { id: 'domestic-worker', name: 'Domestic Worker', icon: Home },
  { id: 'gardener', name: 'Gardener', icon: Flower2 },
  { id: 'painter', name: 'Painter', icon: Paintbrush },
  { id: 'welder', name: 'Welder', icon: Flame },
  { id: 'electrician', name: 'Electrician', icon: Zap },
  { id: 'plumber', name: 'Plumber', icon: Droplets },
  { id: 'carpenter', name: 'Carpenter', icon: Hammer },
  { id: 'tiler', name: 'Tiler', icon: Grid3X3 },
  { id: 'roofer', name: 'Roofer', icon: Warehouse },
  { id: 'pool-cleaner', name: 'Pool Cleaner', icon: Waves },
  { id: 'pest-control', name: 'Pest Control', icon: Bug },
  { id: 'window-cleaner', name: 'Window Cleaner', icon: Sparkles },
  { id: 'handyman', name: 'Handyman', icon: Wrench },
  { id: 'babysitter', name: 'Babysitter', icon: Baby },
  { id: 'dog-walker', name: 'Dog Walker', icon: Dog },
  { id: 'security', name: 'Security', icon: ShieldCheck },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SA_CITIES = [
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'East London', 'Pietermaritzburg', 'Polokwane', 'Nelspruit',
  'Kimberley', 'Rustenburg', 'Soweto', 'Sandton', 'Centurion',
  'Midrand', 'Randburg', 'Roodepoort', 'Benoni', 'Springs',
]

const TOTAL_STEPS = 6

type Credentials = {
  workerCode: string
  password: string
  fullName: string
}

export default function HelpdeskRegistrationPage() {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const idDocRef = useRef<HTMLInputElement>(null)

  // Form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [availableDays, setAvailableDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [city, setCity] = useState('')
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null)
  const [idDocBase64, setIdDocBase64] = useState<string | null>(null)
  const [popiConsent, setPopiConsent] = useState(false)
  const [termsConsent, setTermsConsent] = useState(false)
  const [customPassword, setCustomPassword] = useState('')

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setAvatarBase64(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIdCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setIdDocPreview(result)
        setIdDocBase64(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const toggleDay = (day: number) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const canProceed = () => {
    switch (step) {
      case 0: return fullName.length >= 2
      case 1: return selectedServices.length > 0
      case 2: return availableDays.length > 0
      case 3: return city !== ''
      case 4: return true // documents optional
      case 5: return popiConsent && termsConsent
      default: return false
    }
  }

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/helpdesk/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone: phone || null,
          city,
          selectedServices,
          availableDays,
          popiConsent,
          avatarBase64: avatarBase64 || undefined,
          idDocBase64: idDocBase64 || undefined,
          password: customPassword || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setCredentials({
        workerCode: data.workerCode,
        password: data.password,
        fullName: data.fullName,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep(0)
    setFullName('')
    setPhone('')
    setAvatarPreview(null)
    setAvatarBase64(null)
    setSelectedServices([])
    setAvailableDays([1, 2, 3, 4, 5])
    setCity('')
    setIdDocPreview(null)
    setIdDocBase64(null)
    setPopiConsent(false)
    setTermsConsent(false)
    setCustomPassword('')
    setCredentials(null)
    setError('')
  }

  // Show credentials card after successful registration
  if (credentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          {/* Success icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Registration Complete!</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Show this card to <span className="font-semibold text-foreground">{credentials.fullName}</span>
            </p>
          </div>

          {/* Credentials Card */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white">
              <div className="flex items-center gap-3">
                <IdCard className="w-8 h-8" />
                <div>
                  <p className="text-emerald-100 text-sm font-medium">DomestIQ Worker Card</p>
                  <p className="text-2xl font-bold">{credentials.fullName}</p>
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Your Worker ID
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-mono font-bold text-emerald-700 tracking-wider">
                    {credentials.workerCode}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(credentials.workerCode)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Your Password
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-mono font-bold text-foreground tracking-wider">
                    {credentials.password}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(credentials.password)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                <p className="text-amber-800 font-semibold text-lg mb-1">Take a photo of this card!</p>
                <p className="text-amber-700">
                  Use your Worker ID and password to log in to DomestIQ.
                  You can change your password later in Settings.
                </p>
              </div>
            </div>
          </div>

          {/* Register another */}
          <div className="mt-8 text-center">
            <Button
              onClick={resetForm}
              size="lg"
              className="h-16 px-10 text-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl"
            >
              <RefreshCw className="w-6 h-6 mr-3" />
              Register Next Worker
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Worker Details</h2>
              <p className="text-lg text-muted-foreground">Name, phone, and photo</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name *
                </label>
                <Input
                  placeholder="Enter worker's full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="text-xl h-16 rounded-xl"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Phone Number <span className="text-xs font-normal">(optional)</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex items-center px-4 bg-muted rounded-xl text-base font-medium shrink-0">
                    +27
                  </div>
                  <Input
                    type="tel"
                    placeholder="e.g. 0821234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="text-xl h-16 rounded-xl"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Set Password <span className="text-xs font-normal">(leave blank to auto-generate)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={customPassword}
                  onChange={e => setCustomPassword(e.target.value)}
                  className="text-xl h-16 rounded-xl font-mono"
                  autoComplete="off"
                />
              </div>

              {/* Photo capture */}
              <div className="flex items-center gap-6 pt-2">
                {avatarPreview ? (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary shrink-0">
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handlePhotoCapture}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => photoRef.current?.click()}
                    className="h-14 px-6 text-base rounded-xl"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {avatarPreview ? 'Retake Photo' : 'Take Photo'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    {avatarPreview ? 'Photo captured' : 'Use front-facing camera'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Wrench className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Services</h2>
              <p className="text-lg text-muted-foreground">What does {fullName.split(' ')[0] || 'the worker'} do?</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {SERVICE_OPTIONS.map(svc => {
                const Icon = svc.icon
                const selected = selectedServices.includes(svc.id)
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-95",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-md"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <Icon className="w-10 h-10" />
                    <span className="text-sm font-semibold text-center leading-tight">{svc.name}</span>
                    {selected && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Availability</h2>
              <p className="text-lg text-muted-foreground">Which days can they work?</p>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  onClick={() => toggleDay(idx)}
                  className={cn(
                    "flex flex-col items-center p-6 rounded-2xl border-2 transition-all active:scale-95",
                    availableDays.includes(idx)
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-md"
                      : "border-border bg-card"
                  )}
                >
                  <span className="text-lg font-semibold">{day}</span>
                </button>
              ))}
            </div>
            <p className="text-base text-muted-foreground text-center">
              Default hours: 8:00 AM - 5:00 PM (changeable in app)
            </p>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Location</h2>
              <p className="text-lg text-muted-foreground">Where is {fullName.split(' ')[0] || 'the worker'} based?</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SA_CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={cn(
                    "p-5 text-base rounded-2xl border-2 transition-all text-center active:scale-95",
                    city === c
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">ID Document</h2>
              <p className="text-lg text-muted-foreground">Optional - for verification</p>
            </div>

            <div className="flex flex-col items-center gap-6">
              {idDocPreview ? (
                <div className="relative w-80 h-48 rounded-2xl overflow-hidden border-2 border-primary">
                  <img src={idDocPreview} alt="ID" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-80 h-48 rounded-2xl bg-muted flex flex-col items-center justify-center gap-3 border-2 border-dashed border-muted-foreground/30">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No document captured</p>
                </div>
              )}
              <input
                ref={idDocRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleIdCapture}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => idDocRef.current?.click()}
                className="h-16 px-8 text-lg rounded-2xl"
              >
                <Camera className="w-6 h-6 mr-3" />
                {idDocPreview ? 'Retake Photo' : 'Capture SA ID'}
              </Button>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Take a clear photo of the worker&apos;s SA ID document.
                This is kept private and used only for verification.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Consent & Review</h2>
              <p className="text-lg text-muted-foreground">Review and confirm</p>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border bg-muted/30 p-6 space-y-4">
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-xl font-bold">{fullName}</p>
                  {phone && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-4 h-4" /> +27{phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Services</p>
                  <p className="mt-1">
                    {selectedServices
                      .map(id => SERVICE_OPTIONS.find(s => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">City</p>
                  <p className="mt-1">{city}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Availability</p>
                  <p className="mt-1">
                    {availableDays.map(d => DAYS[d]).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">ID Document</p>
                  <p className="mt-1">{idDocBase64 ? 'Uploaded' : 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Consent checkboxes */}
            <div className="space-y-4">
              <label className="flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer active:scale-[0.99] transition-transform">
                <input
                  type="checkbox"
                  checked={popiConsent}
                  onChange={e => setPopiConsent(e.target.checked)}
                  className="mt-1 w-6 h-6 rounded"
                />
                <div>
                  <p className="text-lg font-semibold">Privacy Consent (POPI Act)</p>
                  <p className="text-muted-foreground">
                    The worker consents to the collection and processing of their personal information.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer active:scale-[0.99] transition-transform">
                <input
                  type="checkbox"
                  checked={termsConsent}
                  onChange={e => setTermsConsent(e.target.checked)}
                  className="mt-1 w-6 h-6 rounded"
                />
                <div>
                  <p className="text-lg font-semibold">Terms of Service</p>
                  <p className="text-muted-foreground">
                    The worker agrees to the Terms of Service. DomestIQ is a matching platform only.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">DomestIQ Help Desk</h1>
            <p className="text-sm text-muted-foreground">Worker Registration</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Step {step + 1} of {TOTAL_STEPS}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={false}
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 pb-32 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 px-6 py-4 text-destructive text-lg text-center"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-5">
        <div className="max-w-3xl mx-auto flex gap-4">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => { setStep(s => s - 1); setError('') }}
              className="h-16 px-8 text-lg rounded-2xl"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (step === TOTAL_STEPS - 1) {
                handleSubmit()
              } else {
                setStep(s => s + 1)
                setError('')
              }
            }}
            disabled={!canProceed() || isLoading}
            className="flex-1 h-16 text-xl rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
            ) : null}
            {step === TOTAL_STEPS - 1
              ? isLoading
                ? 'Registering...'
                : 'Register Worker'
              : 'Next'}
            {step < TOTAL_STEPS - 1 && <ChevronRight className="w-6 h-6 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
