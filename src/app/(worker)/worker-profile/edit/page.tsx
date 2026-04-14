'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useTranslation } from '@/lib/hooks/use-translation'
import { EstateSearchInput } from '@/components/estate/estate-search-input'
import { EstateTag } from '@/components/estate/estate-tag'
import { LocationPicker } from '@/components/worker/location-picker'
import type { Estate } from '@/lib/types/estate'
import type { WorkerServiceArea } from '@/lib/types/worker'
import Image from 'next/image'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SERVICE_OPTIONS = [
  { id: 'domestic-worker', name: 'Domestic Worker', icon: 'home' },
  { id: 'gardener', name: 'Gardener', icon: 'yard' },
  { id: 'painter', name: 'Painter', icon: 'format_paint' },
  { id: 'welder', name: 'Welder', icon: 'local_fire_department' },
  { id: 'electrician', name: 'Electrician', icon: 'bolt' },
  { id: 'plumber', name: 'Plumber', icon: 'plumbing' },
  { id: 'carpenter', name: 'Carpenter', icon: 'carpenter' },
  { id: 'tiler', name: 'Tiler', icon: 'grid_on' },
  { id: 'roofer', name: 'Roofer', icon: 'roofing' },
  { id: 'pool-cleaner', name: 'Pool Cleaner', icon: 'pool' },
  { id: 'pest-control', name: 'Pest Control', icon: 'pest_control' },
  { id: 'window-cleaner', name: 'Window Cleaner', icon: 'window' },
  { id: 'handyman', name: 'Handyman', icon: 'handyman' },
  { id: 'babysitter', name: 'Babysitter', icon: 'child_care' },
  { id: 'dog-walker', name: 'Dog Walker', icon: 'pets' },
  { id: 'security', name: 'Security', icon: 'verified_user' },
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WorkerProfileEditPage() {
  const router = useRouter()
  const { user, profile, isLoading: userLoading } = useUser()
  const { t } = useTranslation()
  const supabase = createClient()

  const [workerProfileId, setWorkerProfileId] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '08:00',
      end_time: '17:00',
      is_available: i >= 1 && i <= 5,
    }))
  )
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [allServices, setAllServices] = useState<{ id: string; name: string }[]>([])
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [serviceRadius, setServiceRadius] = useState(25)
  const [locationName, setLocationName] = useState('')
  const [serviceAreas, setServiceAreas] = useState<Omit<WorkerServiceArea, 'id' | 'worker_id' | 'created_at'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [portfolioImages, setPortfolioImages] = useState<Array<{ id: string; image_url: string; caption: string | null }>>([])
  const [portfolioUploading, setPortfolioUploading] = useState(false)
  const [estateRegistrations, setEstateRegistrations] = useState<Array<{ id: string; estate: { id: string; name: string; suburb: string } }>>([])
  const [, setEstateLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  /* ---- Data Loading ---- */

  useEffect(() => {
    async function loadData() {
      if (!user) return

      const { data: svcList } = await supabase
        .from('services')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order')

      if (svcList) setAllServices(svcList)

      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, bio, hourly_rate, location_lat, location_lng, service_radius_km, location_name')
        .eq('user_id', user.id)
        .single()

      if (wp) {
        setWorkerProfileId(wp.id)
        setBio(wp.bio || '')
        setHourlyRate(wp.hourly_rate?.toString() || '')
        if (wp.location_lat) setLocationLat(wp.location_lat)
        if (wp.location_lng) setLocationLng(wp.location_lng)
        if (wp.service_radius_km) setServiceRadius(wp.service_radius_km)
        if (wp.location_name) setLocationName(wp.location_name)

        const { data: workerSvcs } = await supabase
          .from('worker_services')
          .select('service_id, services(name)')
          .eq('worker_id', wp.id)

        if (workerSvcs) {
          const serviceNames = (workerSvcs as Array<Record<string, unknown>>).map((ws) => {
            const svc = ws.services as { name: string } | { name: string }[] | null
            const name = Array.isArray(svc) ? svc[0]?.name : svc?.name
            return name ? name.toLowerCase().replace(/\s+/g, '-') : null
          }).filter(Boolean) as string[]
          setSelectedServices(serviceNames)
        }

        const { data: avail } = await supabase
          .from('worker_availability')
          .select('day_of_week, start_time, end_time, is_available')
          .eq('worker_id', wp.id)
          .order('day_of_week')

        if (avail && avail.length > 0) {
          setAvailability(prev => {
            const updated = [...prev]
            avail.forEach(slot => {
              const idx = updated.findIndex(a => a.day_of_week === slot.day_of_week)
              if (idx >= 0) {
                updated[idx] = {
                  day_of_week: slot.day_of_week,
                  start_time: slot.start_time.slice(0, 5),
                  end_time: slot.end_time.slice(0, 5),
                  is_available: slot.is_available,
                }
              }
            })
            return updated
          })
        }
      }

      if (wp) {
        const { data: areas } = await supabase
          .from('worker_service_areas')
          .select('area_name, center_lat, center_lng, radius_km')
          .eq('worker_id', wp.id)
        if (areas && areas.length > 0) {
          setServiceAreas(areas.map(a => ({
            area_name: a.area_name,
            center_lat: a.center_lat,
            center_lng: a.center_lng,
            radius_km: a.radius_km,
          })))
        }
      }

      if (wp) {
        const { data: portfolio } = await supabase
          .from('portfolio_images')
          .select('id, image_url, caption')
          .eq('worker_profile_id', wp.id)
          .order('sort_order')
        if (portfolio) setPortfolioImages(portfolio)
      }

      const { data: estates } = await supabase
        .from('worker_estate_registrations')
        .select('id, estates(id, name, suburb)')
        .eq('worker_id', user.id)

      if (estates) {
        setEstateRegistrations(
          estates.map(e => ({
            id: e.id,
            estate: e.estates as unknown as { id: string; name: string; suburb: string },
          }))
        )
      }

      if (profile?.avatar_url) {
        setAvatarPreview(profile.avatar_url)
      }

      setIsLoading(false)
    }

    if (!userLoading) loadData()
  }, [user, profile, userLoading, supabase])

  /* ---- Handlers ---- */

  const toggleService = (slug: string) => {
    setSelectedServices(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const toggleDay = (dayIndex: number) => {
    setAvailability(prev =>
      prev.map(a =>
        a.day_of_week === dayIndex ? { ...a, is_available: !a.is_available } : a
      )
    )
  }

  const updateTime = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev =>
      prev.map(a =>
        a.day_of_week === dayIndex ? { ...a, [field]: value } : a
      )
    )
  }

  const handleLocationChange = (lat: number, lng: number, name: string) => {
    setLocationLat(lat)
    setLocationLng(lng)
    setLocationName(name)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user || !workerProfileId) return
    setPortfolioUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('portfolio').upload(fileName, file)
        if (uploadErr) continue
        const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(fileName)
        const { data: row } = await supabase
          .from('portfolio_images')
          .insert({
            worker_profile_id: workerProfileId,
            image_url: urlData.publicUrl,
            sort_order: portfolioImages.length + i,
          })
          .select('id, image_url, caption')
          .single()
        if (row) setPortfolioImages(prev => [...prev, row])
      }
    } catch {
      setError('Failed to upload some images')
    } finally {
      setPortfolioUploading(false)
      e.target.value = ''
    }
  }

  const handlePortfolioDelete = async (imageId: string, imageUrl: string) => {
    try {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/portfolio/')
      if (pathParts[1]) {
        await supabase.storage.from('portfolio').remove([decodeURIComponent(pathParts[1])])
      }
      await supabase.from('portfolio_images').delete().eq('id', imageId)
      setPortfolioImages(prev => prev.filter(img => img.id !== imageId))
    } catch {
      setError('Failed to delete image')
    }
  }

  const handleAddEstate = async (estate: Estate) => {
    if (!user) return
    setEstateLoading(true)
    try {
      const { data, error } = await supabase
        .from('worker_estate_registrations')
        .insert({ worker_id: user.id, estate_id: estate.id })
        .select('id')
        .single()

      if (error) {
        if (error.code === '23505') {
          setError('You are already registered at this estate')
        } else {
          throw error
        }
      } else if (data) {
        setEstateRegistrations(prev => [...prev, {
          id: data.id,
          estate: { id: estate.id, name: estate.name, suburb: estate.suburb },
        }])
      }
    } catch {
      setError('Failed to add estate registration')
    } finally {
      setEstateLoading(false)
    }
  }

  const handleRemoveEstate = async (registrationId: string) => {
    try {
      await supabase
        .from('worker_estate_registrations')
        .delete()
        .eq('id', registrationId)

      setEstateRegistrations(prev => prev.filter(e => e.id !== registrationId))
    } catch {
      setError('Failed to remove estate registration')
    }
  }

  const calculateCompleteness = (): number => {
    let score = 0
    if (profile?.full_name) score += 10
    if (avatarPreview) score += 15
    if (bio.trim().length > 0) score += 15
    if (hourlyRate) score += 10
    if (selectedServices.length > 0) score += 15
    if (availability.some(a => a.is_available)) score += 10
    if (locationLat && locationLng) score += 15
    score += 10
    return Math.min(score, 100)
  }

  const handleSave = async () => {
    setError('')
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      if (!user || !workerProfileId) throw new Error('Not authenticated')

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
      }

      await supabase
        .from('worker_profiles')
        .update({
          bio: bio.trim() || null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          location_lat: locationLat,
          location_lng: locationLng,
          location_name: locationName || null,
          service_radius_km: serviceRadius,
          profile_completeness: calculateCompleteness(),
        })
        .eq('id', workerProfileId)

      await supabase.from('worker_service_areas').delete().eq('worker_id', workerProfileId)
      if (serviceAreas.length > 0) {
        await supabase.from('worker_service_areas').insert(
          serviceAreas.map(a => ({
            worker_id: workerProfileId,
            area_name: a.area_name,
            center_lat: a.center_lat,
            center_lng: a.center_lng,
            radius_km: a.radius_km,
          }))
        )
      }

      await supabase.from('worker_services').delete().eq('worker_id', workerProfileId)

      if (selectedServices.length > 0 && allServices.length > 0) {
        const serviceLinks = selectedServices
          .map(slug => {
            const svc = allServices.find(s =>
              s.name.toLowerCase().replace(/\s+/g, '-') === slug
            )
            return svc ? { worker_id: workerProfileId, service_id: svc.id } : null
          })
          .filter(Boolean)

        if (serviceLinks.length > 0) {
          await supabase.from('worker_services').insert(serviceLinks)
        }
      }

      await supabase.from('worker_availability').delete().eq('worker_id', workerProfileId)

      const availRecords = availability.map(a => ({
        worker_id: workerProfileId,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
        is_available: a.is_available,
      }))

      await supabase.from('worker_availability').insert(availRecords)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  /* ---- Loading Skeleton ---- */

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7]">
        <header className="bg-[#f9f9f7] flex items-center gap-4 px-6 h-16 sticky top-0 z-50">
          <div className="w-10 h-10 rounded-full bg-[#e8e8e6] animate-pulse" />
          <div className="h-5 w-28 rounded bg-[#e8e8e6] animate-pulse" />
        </header>
        <div className="px-6 max-w-md mx-auto w-full space-y-6 pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#e8e8e6] animate-pulse" />
            <div className="h-6 w-40 rounded bg-[#e8e8e6] animate-pulse" />
          </div>
          <div className="h-28 rounded-xl bg-white animate-pulse" />
          <div className="h-20 rounded-xl bg-white animate-pulse" />
          <div className="h-48 rounded-xl bg-white animate-pulse" />
          <div className="h-32 rounded-xl bg-white animate-pulse" />
        </div>
      </div>
    )
  }

  /* ---- Derived ---- */

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const dqCode = user?.email?.startsWith('dq')
    ? user.email.split('@')[0]?.toUpperCase()
    : null

  /* ---- Render ---- */

  return (
    <div className="min-h-screen bg-[#f9f9f7] flex flex-col">
      {/* Top App Bar */}
      <header className="bg-[#f9f9f7] flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-[#005d42] hover:bg-[#e2e3e1] transition-colors p-2 rounded-full active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-heading font-bold text-lg tracking-tight text-[#1a1c1b]">
            {t('worker.edit_profile', 'Edit Profile')}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="font-heading font-bold text-[#047857] hover:bg-[#e2e3e1] transition-colors px-4 py-2 rounded-lg active:scale-95 duration-150 disabled:opacity-50"
        >
          {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-28 overflow-y-auto px-6 max-w-md mx-auto w-full">
        {/* Avatar Section */}
        <section className="flex flex-col items-center pt-8 pb-10">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e8e8e6]">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={profile?.full_name || 'Profile'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#005d42] flex items-center justify-center text-white font-heading font-bold text-xl">
                  {initials}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[#005d42] text-white p-1.5 rounded-full shadow-lg active:scale-90 transition-transform cursor-pointer">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                photo_camera
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <div className="mt-4 text-center">
            <h2 className="font-heading font-extrabold text-2xl tracking-tight text-[#1a1c1b]">
              {profile?.full_name || 'Your Name'}
            </h2>
            {dqCode && (
              <p className="font-mono text-sm tracking-widest text-[#3e4943] bg-[#e8e8e6] px-2 py-0.5 rounded mt-1 inline-block">
                {dqCode}
              </p>
            )}
          </div>
        </section>

        <div className="space-y-10">
          {/* Professional Bio */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              {t('worker.bio', 'Professional Bio')}
            </label>
            <div className="bg-[#f4f4f2] p-4 rounded-lg focus-within:bg-white transition-colors border-b-2 border-transparent focus-within:border-[#005d42]">
              <textarea
                className="w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-[#1a1c1b] leading-relaxed text-sm resize-none"
                rows={3}
                placeholder={t('worker.bio_placeholder', 'Tell clients about yourself, your experience, and what makes your work stand out...')}
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={500}
              />
            </div>
            <p className="text-[11px] text-[#6e7a73] px-1">{bio.length}/500</p>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              {t('worker.hourly_rate', 'Hourly Rate')}
            </label>
            <div className="flex items-center bg-[#f4f4f2] rounded-lg overflow-hidden focus-within:bg-white transition-colors border-b-2 border-transparent focus-within:border-[#005d42]">
              <span className="pl-4 font-heading font-bold text-[#3e4943]">R</span>
              <input
                className="w-full bg-transparent border-none py-4 focus:ring-0 focus:outline-none text-[#1a1c1b] font-heading font-bold text-lg"
                type="number"
                placeholder="150"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                min={0}
                step={10}
              />
              <span className="pr-4 text-sm text-[#6e7a73]">/hr</span>
            </div>
          </div>

          {/* Offered Services */}
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              {t('worker.services', 'Offered Services')}
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {SERVICE_OPTIONS.map(svc => {
                const selected = selectedServices.includes(svc.id)
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={`
                      px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold
                      transition-all duration-150 active:scale-95
                      ${selected
                        ? 'bg-[#005d42] text-white'
                        : 'bg-[#e2e3e1] text-[#3e4943] hover:bg-[#d0d1cf]'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-[18px]">{svc.icon}</span>
                    <span>{svc.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Weekly Availability */}
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              {t('worker.availability', 'Weekly Availability')}
            </label>

            {/* Day circles row */}
            <div className="flex justify-between items-center bg-[#f4f4f2] p-5 rounded-xl">
              {availability.map(slot => (
                <button
                  key={slot.day_of_week}
                  onClick={() => toggleDay(slot.day_of_week)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-150 active:scale-90
                    ${slot.is_available
                      ? 'bg-[#005d42] text-white'
                      : 'bg-[#e2e3e1] text-[#3e4943]'
                    }
                  `}
                >
                  {DAY_LABELS[slot.day_of_week]}
                </button>
              ))}
            </div>

            {/* Time inputs for active days */}
            <div className="space-y-2">
              {availability.filter(s => s.is_available).map(slot => (
                <div
                  key={slot.day_of_week}
                  className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm"
                >
                  <span className="text-sm font-bold text-[#005d42] w-8 shrink-0">
                    {DAY_NAMES[slot.day_of_week]}
                  </span>
                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={e => updateTime(slot.day_of_week, 'start_time', e.target.value)}
                    className="flex-1 bg-[#f4f4f2] border-none rounded-lg py-2 px-3 text-sm text-[#1a1c1b] focus:ring-0 focus:outline-none"
                  />
                  <span className="text-[#6e7a73] text-xs">to</span>
                  <input
                    type="time"
                    value={slot.end_time}
                    onChange={e => updateTime(slot.day_of_week, 'end_time', e.target.value)}
                    className="flex-1 bg-[#f4f4f2] border-none rounded-lg py-2 px-3 text-sm text-[#1a1c1b] focus:ring-0 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Service Area */}
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#005d42]">location_on</span>
                {t('worker.service_area', 'Service Area')}
              </span>
            </label>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-[#3e4943] mb-4">
                {t('worker.service_area_desc', 'Set where you work -- select cities, search an address, or use GPS')}
              </p>
              <LocationPicker
                locationLat={locationLat}
                locationLng={locationLng}
                locationName={locationName}
                serviceRadius={serviceRadius}
                serviceAreas={serviceAreas}
                onLocationChange={handleLocationChange}
                onRadiusChange={setServiceRadius}
                onServiceAreasChange={setServiceAreas}
              />
            </div>
          </div>

          {/* Work Portfolio */}
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#005d42]">photo_library</span>
                {t('worker.portfolio', 'Work Portfolio')}
              </span>
            </label>
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <p className="text-sm text-[#3e4943]">
                {t('worker.portfolio_desc', 'Show clients the quality of your work. Upload before & after photos, completed projects, etc.')}
              </p>

              {portfolioImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {portfolioImages.map(img => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={img.image_url}
                        alt={img.caption || 'Portfolio'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 200px"
                      />
                      <button
                        onClick={() => handlePortfolioDelete(img.id, img.image_url)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-white text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="cursor-pointer block">
                <div className={`
                  flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors
                  ${portfolioUploading
                    ? 'border-[#005d42] bg-[#005d42]/5'
                    : 'border-[#bdc9c1] hover:border-[#005d42] hover:bg-[#005d42]/5'
                  }
                `}>
                  {portfolioUploading ? (
                    <>
                      <span className="material-symbols-outlined text-[#005d42] animate-spin text-[20px]">progress_activity</span>
                      <span className="text-sm font-medium text-[#005d42]">{t('common.uploading', 'Uploading...')}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#6e7a73] text-[20px]">add_photo_alternate</span>
                      <span className="text-sm font-medium text-[#6e7a73]">{t('worker.add_photos', 'Add Photos')}</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePortfolioUpload}
                  disabled={portfolioUploading}
                />
              </label>
              <p className="text-[11px] text-[#6e7a73] text-center">
                {portfolioImages.length}/12 photos
              </p>
            </div>
          </div>

          {/* Estate Registrations */}
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#005d42]">apartment</span>
                {t('worker.estate_registrations', 'Estate Registrations')}
              </span>
            </label>
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <p className="text-sm text-[#3e4943]">
                {t('worker.estate_desc', 'Add estates and complexes where you are registered to work. This helps clients in those areas find you.')}
              </p>

              {estateRegistrations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {estateRegistrations.map(reg => (
                    <EstateTag
                      key={reg.id}
                      name={reg.estate.name}
                      suburb={reg.estate.suburb}
                      onRemove={() => handleRemoveEstate(reg.id)}
                    />
                  ))}
                </div>
              )}

              <EstateSearchInput
                placeholder={t('worker.search_estate', 'Search for an estate...')}
                onSelect={(estate: Estate) => handleAddEstate(estate)}
              />
              <p className="text-[11px] text-[#6e7a73] text-center">
                {estateRegistrations.length} estate{estateRegistrations.length !== 1 ? 's' : ''} registered
              </p>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-widest font-bold text-[#3e4943] opacity-70 px-1">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#904d00]">verified_user</span>
                {t('worker.verification', 'Verification Documents')}
              </span>
            </label>
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <p className="text-sm text-[#3e4943]">
                {t('worker.verification_desc', 'Get verified to appear higher in search results and earn more bookings.')}
              </p>
              <Link
                href="/worker-verification"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-[#904d00] text-[#904d00] font-heading font-bold text-sm hover:bg-[#904d00]/5 transition-colors active:scale-[0.98] duration-150"
              >
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                {t('worker.manage_verification', 'Manage Verification')}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#ba1a1a] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-[slideDown_0.2s_ease-out]">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-2 hover:opacity-70">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#005d42] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-[slideDown_0.2s_ease-out]">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="text-sm font-medium">{t('common.saved', 'Profile saved successfully')}</span>
        </div>
      )}

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#f9f9f7] via-[#f9f9f7] to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#005d42] text-white py-4 rounded-lg font-heading font-bold text-lg shadow-xl active:scale-[0.98] active:bg-[#047857] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                {t('common.saving', 'Saving...')}
              </>
            ) : saveSuccess ? (
              <>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                {t('common.saved_short', 'Saved!')}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                {t('common.save_changes', 'Save Changes')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
