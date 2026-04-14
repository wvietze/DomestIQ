'use client'

import { useState, useRef } from 'react'
import { registerWorkerAction } from './actions'
import { cn } from '@/lib/utils'
import { WaveBars } from '@/components/loading'

type ServiceOption = {
  id: string
  name: string
  icon: string
}

const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'domestic-worker', name: 'Cleaning', icon: 'cleaning_services' },
  { id: 'gardener', name: 'Gardening', icon: 'potted_plant' },
  { id: 'painter', name: 'Painting', icon: 'format_paint' },
  { id: 'plumber', name: 'Plumbing', icon: 'plumbing' },
  { id: 'electrician', name: 'Electrical', icon: 'bolt' },
  { id: 'welder', name: 'Welding', icon: 'precision_manufacturing' },
  { id: 'babysitter', name: 'Child Care', icon: 'child_care' },
  { id: 'elder-care', name: 'Elder Care', icon: 'elderly' },
  { id: 'cook', name: 'Cooking', icon: 'cooking' },
  { id: 'laundry', name: 'Laundry', icon: 'local_laundry_service' },
  { id: 'security', name: 'Security', icon: 'security' },
  { id: 'handyman', name: 'Handyman', icon: 'handyman' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SA_CITIES = [
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'East London', 'Pietermaritzburg', 'Polokwane', 'Nelspruit',
  'Kimberley', 'Rustenburg', 'Soweto', 'Sandton', 'Centurion',
  'Midrand', 'Randburg', 'Roodepoort', 'Benoni', 'Springs',
]

const STEP_LABELS = [
  '1. Name & Phone',
  '2. Services',
  '3. Availability',
  '4. Location',
  '5. ID Document',
  '6. Consent',
]

const TOTAL_STEPS = STEP_LABELS.length

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
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleDay = (day: number) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const canProceed = () => {
    switch (step) {
      case 0: return fullName.length >= 2
      case 1: return selectedServices.length > 0
      case 2: return availableDays.length > 0
      case 3: return city !== ''
      case 4: return true
      case 5: return popiConsent && termsConsent
      default: return false
    }
  }

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)
    try {
      const data = await registerWorkerAction({
        fullName,
        phone: phone || null,
        city,
        selectedServices,
        availableDays,
        popiConsent,
        avatarBase64: avatarBase64 || undefined,
        idDocBase64: idDocBase64 || undefined,
        password: customPassword || undefined,
      })

      if (data.error) {
        throw new Error(data.error)
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

  // Credentials success screen
  if (credentials) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f7] p-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#97f5cc]">
              <span
                className="material-symbols-outlined text-[#005d42]"
                style={{ fontSize: '3.5rem', fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#1a1c1b]">
              Registration Complete
            </h1>
            <p className="mt-2 text-lg text-[#3e4943]">
              Show this card to{' '}
              <span className="font-bold text-[#1a1c1b]">{credentials.fullName}</span>
            </p>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="bg-[#005d42] px-8 py-6 text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl">badge</span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#9ffdd3]">
                    DomestIQ Worker Card
                  </p>
                  <p className="font-heading text-2xl font-bold">{credentials.fullName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-8">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                  Worker ID
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-4xl font-bold tracking-wider text-[#005d42]">
                    {credentials.workerCode}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(credentials.workerCode)}
                    className="rounded-lg p-2 text-[#3e4943] transition-colors hover:bg-[#f4f4f2]"
                    aria-label="Copy Worker ID"
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                  Password
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-4xl font-bold tracking-wider text-[#1a1c1b]">
                    {credentials.password}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(credentials.password)}
                    className="rounded-lg p-2 text-[#3e4943] transition-colors hover:bg-[#f4f4f2]"
                    aria-label="Copy password"
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-[#904d00] bg-[#ffdcc3] p-5">
                <p className="mb-1 font-heading text-lg font-bold text-[#6e3900]">
                  Take a photo of this card!
                </p>
                <p className="text-sm text-[#6e3900]">
                  Use the Worker ID and password to sign in to DomestIQ. The worker can
                  change their password later in Settings.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-3 rounded-lg bg-[#005d42] px-10 py-5 font-heading text-xl font-bold text-white shadow-xl shadow-[#005d42]/20 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">refresh</span>
              Register Next Worker
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-[#1a1c1b]">
                Who are we registering?
              </h2>
              <p className="mt-2 text-lg text-[#3e4943]">
                Staff: enter the worker&apos;s name and take a photo.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter worker's full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-16 w-full rounded-lg border-none bg-[#f4f4f2] px-4 text-xl text-[#1a1c1b] focus:outline-none focus:ring-2 focus:ring-[#005d42]"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                  Phone Number <span className="font-normal normal-case">(optional)</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex shrink-0 items-center rounded-lg bg-[#e8e8e6] px-4 text-base font-bold text-[#1a1c1b]">
                    +27
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 0821234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-16 w-full rounded-lg border-none bg-[#f4f4f2] px-4 text-xl text-[#1a1c1b] focus:outline-none focus:ring-2 focus:ring-[#005d42]"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                  Set Password{' '}
                  <span className="font-normal normal-case">(leave blank to auto-generate)</span>
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="h-16 w-full rounded-lg border-none bg-[#f4f4f2] px-4 font-mono text-xl text-[#1a1c1b] focus:outline-none focus:ring-2 focus:ring-[#005d42]"
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                {avatarPreview ? (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-4 border-[#005d42]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[#f4f4f2]">
                    <span className="material-symbols-outlined text-5xl text-[#6e7a73]">
                      photo_camera
                    </span>
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
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="inline-flex h-14 items-center gap-2 rounded-lg border border-[#bdc9c1] bg-white px-6 font-bold text-[#1a1c1b] transition-colors hover:bg-[#f4f4f2]"
                  >
                    <span className="material-symbols-outlined">photo_camera</span>
                    {avatarPreview ? 'Retake Photo' : 'Take Photo'}
                  </button>
                  <p className="mt-2 text-sm text-[#3e4943]">
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
            <div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-[#1a1c1b]">
                What services does this worker offer?
              </h2>
              <p className="mt-2 text-lg text-[#3e4943]">
                Tap all that apply. Ask the worker to point at the icons.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {SERVICE_OPTIONS.map((svc) => {
                const selected = selectedServices.includes(svc.id)
                return (
                  <button
                    type="button"
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={cn(
                      'group relative flex flex-col items-center justify-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-all active:scale-95',
                      selected
                        ? 'border-4 border-[#005d42]'
                        : 'border-4 border-transparent hover:bg-[#f4f4f2]'
                    )}
                  >
                    {selected && (
                      <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#005d42] text-white shadow-lg">
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      </div>
                    )}
                    <span
                      className={cn(
                        'material-symbols-outlined transition-colors',
                        selected ? 'text-[#005d42]' : 'text-[#3e4943] group-hover:text-[#005d42]'
                      )}
                      style={{ fontSize: '3.5rem' }}
                    >
                      {svc.icon}
                    </span>
                    <span className="text-center font-heading text-lg font-bold text-[#1a1c1b]">
                      {svc.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-[#1a1c1b]">
                Which days can they work?
              </h2>
              <p className="mt-2 text-lg text-[#3e4943]">Tap each available day.</p>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {DAYS.map((day, idx) => {
                const selected = availableDays.includes(idx)
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(idx)}
                    className={cn(
                      'flex flex-col items-center rounded-xl p-6 shadow-sm transition-all active:scale-95',
                      selected
                        ? 'border-4 border-[#005d42] bg-white text-[#005d42]'
                        : 'border-4 border-transparent bg-white text-[#1a1c1b] hover:bg-[#f4f4f2]'
                    )}
                  >
                    <span className="font-heading text-lg font-bold">{day}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-center text-base text-[#3e4943]">
              Default hours: 8:00 AM – 5:00 PM (adjustable in app)
            </p>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-[#1a1c1b]">
                Where is {fullName.split(' ')[0] || 'the worker'} based?
              </h2>
              <p className="mt-2 text-lg text-[#3e4943]">Pick the closest city.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {SA_CITIES.map((c) => {
                const selected = city === c
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCity(c)}
                    className={cn(
                      'rounded-xl bg-white p-5 text-center text-base shadow-sm transition-all active:scale-95',
                      selected
                        ? 'border-4 border-[#005d42] font-bold text-[#005d42]'
                        : 'border-4 border-transparent font-medium text-[#1a1c1b] hover:bg-[#f4f4f2]'
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-[#1a1c1b]">
                SA ID Document
              </h2>
              <p className="mt-2 text-lg text-[#3e4943]">
                Optional — but strongly recommended for verification.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              {idDocPreview ? (
                <div className="relative h-48 w-80 overflow-hidden rounded-xl border-4 border-[#005d42]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={idDocPreview} alt="ID" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-48 w-80 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#bdc9c1] bg-[#f4f4f2]">
                  <span className="material-symbols-outlined text-5xl text-[#6e7a73]">
                    description
                  </span>
                  <p className="text-[#3e4943]">No document captured</p>
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
              <button
                type="button"
                onClick={() => idDocRef.current?.click()}
                className="inline-flex h-16 items-center gap-3 rounded-lg border border-[#bdc9c1] bg-white px-8 font-bold text-[#1a1c1b] transition-colors hover:bg-[#f4f4f2]"
              >
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                {idDocPreview ? 'Retake Photo' : 'Capture SA ID'}
              </button>
              <p className="max-w-sm text-center text-sm text-[#3e4943]">
                Take a clear photo of the worker&apos;s SA ID. Kept private, used only for
                verification.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-[#1a1c1b]">
                Review and confirm
              </h2>
              <p className="mt-2 text-lg text-[#3e4943]">
                Please read both consents aloud to the worker.
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#f4f4f2]">
                    <span className="material-symbols-outlined text-3xl text-[#6e7a73]">
                      person
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-heading text-xl font-bold text-[#1a1c1b]">{fullName}</p>
                  {phone && (
                    <p className="flex items-center gap-1 text-[#3e4943]">
                      <span className="material-symbols-outlined text-base">call</span> +27{phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                    Services
                  </p>
                  <p className="mt-1 text-[#1a1c1b]">
                    {selectedServices
                      .map((id) => SERVICE_OPTIONS.find((s) => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                    City
                  </p>
                  <p className="mt-1 text-[#1a1c1b]">{city}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                    Availability
                  </p>
                  <p className="mt-1 text-[#1a1c1b]">
                    {availableDays.map((d) => DAYS[d]).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#3e4943]">
                    ID Document
                  </p>
                  <p className="mt-1 text-[#1a1c1b]">
                    {idDocBase64 ? 'Uploaded' : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4">
              <label
                className={cn(
                  'flex cursor-pointer items-start gap-4 rounded-xl bg-white p-5 shadow-sm transition-all active:scale-[0.99]',
                  popiConsent ? 'border-4 border-[#005d42]' : 'border-4 border-transparent'
                )}
              >
                <input
                  type="checkbox"
                  checked={popiConsent}
                  onChange={(e) => setPopiConsent(e.target.checked)}
                  className="mt-1 h-6 w-6 rounded accent-[#005d42]"
                />
                <div>
                  <p className="font-heading text-lg font-bold text-[#1a1c1b]">
                    Privacy Consent (POPI Act)
                  </p>
                  <p className="text-[#3e4943]">
                    The worker consents to the collection and processing of their personal
                    information.
                  </p>
                </div>
              </label>
              <label
                className={cn(
                  'flex cursor-pointer items-start gap-4 rounded-xl bg-white p-5 shadow-sm transition-all active:scale-[0.99]',
                  termsConsent ? 'border-4 border-[#005d42]' : 'border-4 border-transparent'
                )}
              >
                <input
                  type="checkbox"
                  checked={termsConsent}
                  onChange={(e) => setTermsConsent(e.target.checked)}
                  className="mt-1 h-6 w-6 rounded accent-[#005d42]"
                />
                <div>
                  <p className="font-heading text-lg font-bold text-[#1a1c1b]">
                    Terms of Service
                  </p>
                  <p className="text-[#3e4943]">
                    The worker agrees to the Terms of Service. DomestIQ is a matching platform
                    only.
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
    <div className="flex min-h-screen flex-col bg-[#f9f9f7] text-[#1a1c1b]">
      {/* Header */}
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-[#f9f9f7] px-6 py-5 sm:px-10">
        <div className="flex items-center gap-4">
          <span className="font-heading text-3xl font-extrabold tracking-tighter text-[#005d42]">
            DomestIQ
          </span>
          <div className="hidden h-8 w-px bg-[#e8e8e6] sm:block" />
          <span className="hidden font-heading font-bold tracking-tight text-[#005d42] sm:block">
            Help Desk Kiosk
          </span>
        </div>
        <div className="flex gap-2 text-[#3e4943]">
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-[#e8e8e6]"
            aria-label="Help"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-[#e8e8e6]"
            aria-label="Info"
          >
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto mb-32 mt-24 w-full max-w-6xl flex-1 px-6 sm:px-10">
        {/* Step indicators */}
        <div className="no-scrollbar mb-10 flex items-center justify-between overflow-x-auto py-4">
          {STEP_LABELS.map((label, idx) => {
            const isCurrent = idx === step
            const isComplete = idx < step
            return (
              <div key={label} className="flex items-center">
                <div
                  className={cn(
                    'flex shrink-0 items-center gap-3',
                    !isCurrent && !isComplete && 'opacity-40'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center rounded-full font-bold',
                      isCurrent
                        ? 'h-10 w-10 bg-[#005d42] text-white'
                        : isComplete
                          ? 'h-8 w-8 bg-[#005d42] text-white'
                          : 'h-8 w-8 bg-[#e8e8e6] text-[#3e4943]'
                    )}
                  >
                    {isComplete ? (
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 700" }}
                      >
                        check
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      isCurrent
                        ? 'font-heading text-lg font-extrabold tracking-tight text-[#1a1c1b] underline decoration-[#005d42] decoration-4 underline-offset-8'
                        : 'font-semibold text-[#3e4943]'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className="mx-2 h-px w-8 bg-[#e8e8e6]" />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div
          key={step}
          className="animate-in fade-in duration-200"
          style={{ animationDuration: '250ms' }}
        >
          {renderStep()}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border-l-4 border-[#ba1a1a] bg-[#ffdad6] px-6 py-4 text-center text-lg text-[#93000a]">
            {error}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-between border-t-2 border-[#f4f4f2] bg-white px-6 pb-8 pt-4 shadow-[0_-8px_24px_rgba(26,28,27,0.06)] sm:px-10">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setStep((s) => s - 1)
              setError('')
            }}
            className="inline-flex items-center justify-center gap-4 rounded-xl bg-[#f4f4f2] px-10 py-5 text-[#1a1c1b] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-heading text-xl font-bold">Back</span>
          </button>
        ) : (
          <div />
        )}

        <div className="hidden text-lg font-medium italic text-[#3e4943] sm:block">
          {step === 1 && `${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'} selected`}
          {step === 2 && `${availableDays.length} day${availableDays.length === 1 ? '' : 's'} selected`}
          {step === 3 && city && `Location: ${city}`}
        </div>

        <button
          type="button"
          onClick={() => {
            if (step === TOTAL_STEPS - 1) {
              handleSubmit()
            } else {
              setStep((s) => s + 1)
              setError('')
            }
          }}
          disabled={!canProceed() || isLoading}
          className="inline-flex items-center justify-center gap-4 rounded-xl bg-[#005d42] px-14 py-5 text-white shadow-xl shadow-[#005d42]/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
        >
          {isLoading ? (
            <WaveBars size="sm" />
          ) : null}
          <span className="font-heading text-xl font-bold">
            {step === TOTAL_STEPS - 1
              ? isLoading
                ? 'Registering…'
                : 'Register Worker'
              : 'Next Step'}
          </span>
          {step < TOTAL_STEPS - 1 && (
            <span className="material-symbols-outlined">arrow_forward</span>
          )}
        </button>
      </nav>
    </div>
  )
}
