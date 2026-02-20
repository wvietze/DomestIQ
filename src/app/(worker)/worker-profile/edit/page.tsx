'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Camera, Save, Loader2, CheckCircle2, ArrowLeft,
  Home, Flower2, Paintbrush, Flame, Zap, Droplets,
  Hammer, Grid3X3, Warehouse, Waves, Bug, Sparkles,
  Wrench, Baby, Dog, ShieldCheck, MapPin, Navigation,
  ImagePlus, X, GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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

interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export default function WorkerProfileEditPage() {
  const router = useRouter()
  const { user, profile, isLoading: userLoading } = useUser()
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
      is_available: i >= 1 && i <= 5, // Mon-Fri default
    }))
  )
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [allServices, setAllServices] = useState<{ id: string; name: string }[]>([])
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [serviceRadius, setServiceRadius] = useState(25)
  const [locationName, setLocationName] = useState('')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [portfolioImages, setPortfolioImages] = useState<Array<{ id: string; image_url: string; caption: string | null }>>([])
  const [portfolioUploading, setPortfolioUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!user) return

      // Get all services from DB
      const { data: svcList } = await supabase
        .from('services')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order')

      if (svcList) setAllServices(svcList)

      // Get worker profile
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id, bio, hourly_rate, location_lat, location_lng, service_radius_km')
        .eq('user_id', user.id)
        .single()

      if (wp) {
        setWorkerProfileId(wp.id)
        setBio(wp.bio || '')
        setHourlyRate(wp.hourly_rate?.toString() || '')
        if (wp.location_lat) setLocationLat(wp.location_lat)
        if (wp.location_lng) setLocationLng(wp.location_lng)
        if (wp.service_radius_km) setServiceRadius(wp.service_radius_km)

        // Get currently linked services
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

        // Get availability
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

      // Load portfolio images
      if (wp) {
        const { data: portfolio } = await supabase
          .from('portfolio_images')
          .select('id, image_url, caption')
          .eq('worker_profile_id', wp.id)
          .order('sort_order')
        if (portfolio) setPortfolioImages(portfolio)
      }

      // Set avatar preview from current profile
      if (profile?.avatar_url) {
        setAvatarPreview(profile.avatar_url)
      }

      setIsLoading(false)
    }

    if (!userLoading) loadData()
  }, [user, profile, userLoading, supabase])

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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    setIsDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLocationLat(lat)
        setLocationLng(lng)
        // Try reverse geocoding for a friendly name
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          )
          if (res.ok) {
            const data = await res.json()
            if (data.results?.[0]) {
              const components = data.results[0].address_components
              const suburb = components.find((c: { types: string[] }) => c.types.includes('sublocality'))?.long_name
              const city = components.find((c: { types: string[] }) => c.types.includes('locality'))?.long_name
              setLocationName([suburb, city].filter(Boolean).join(', ') || data.results[0].formatted_address)
            }
          }
        } catch {
          setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        }
        setIsDetectingLocation(false)
      },
      () => {
        setError('Could not detect your location. Please check permissions.')
        setIsDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
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
      // Extract storage path from URL
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

  const calculateCompleteness = (): number => {
    let score = 0
    if (profile?.full_name) score += 10
    if (avatarPreview) score += 15
    if (bio.trim().length > 0) score += 15
    if (hourlyRate) score += 10
    if (selectedServices.length > 0) score += 15
    if (availability.some(a => a.is_available)) score += 10
    if (locationLat && locationLng) score += 15
    score += 10 // base for having an account
    return Math.min(score, 100)
  }

  const handleSave = async () => {
    setError('')
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      if (!user || !workerProfileId) throw new Error('Not authenticated')

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
      }

      // Update worker profile
      await supabase
        .from('worker_profiles')
        .update({
          bio: bio.trim() || null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          location_lat: locationLat,
          location_lng: locationLng,
          service_radius_km: serviceRadius,
          profile_completeness: calculateCompleteness(),
        })
        .eq('id', workerProfileId)

      // Update services: delete old, insert new
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

      // Update availability: delete old, insert new
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

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-24 rounded-full mx-auto" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarPreview || undefined} alt="Profile" />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer shadow-md">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Tap camera icon to change photo</p>
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tell clients about yourself, your experience, and why they should hire you..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {bio.length}/500 characters
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hourly Rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hourly Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-muted-foreground">R</span>
              <Input
                type="number"
                placeholder="150"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                min={0}
                step={10}
                className="text-lg"
              />
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Services Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Tap to select the services you offer
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_OPTIONS.map(svc => {
                const Icon = svc.icon
                const selected = selectedServices.includes(svc.id)
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-border bg-card hover:border-emerald-300'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {svc.name}
                    </span>
                    {selected && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Service Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set your location and how far you are willing to travel for work
            </p>

            {/* Current Location */}
            {locationLat && locationLng ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-900">
                      {locationName || `${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}`}
                    </p>
                    <p className="text-xs text-emerald-700">
                      {serviceRadius}km service radius
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  No location set yet. Clients won&apos;t be able to find you in area searches.
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="w-full gap-2"
            >
              {isDetectingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {isDetectingLocation ? 'Detecting...' : 'Use My Current Location'}
            </Button>

            {/* Service Radius Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">How far will you travel?</Label>
                <span className="text-sm font-bold text-emerald-700">{serviceRadius} km</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={serviceRadius}
                onChange={e => setServiceRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Availability */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Toggle days and set your working hours
            </p>
            {availability.map(slot => (
              <div key={slot.day_of_week} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(slot.day_of_week)}
                  className={cn(
                    'w-12 h-10 rounded-lg border-2 text-sm font-medium transition-all flex-shrink-0',
                    slot.is_available
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {DAYS[slot.day_of_week]}
                </button>
                {slot.is_available ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={e => updateTime(slot.day_of_week, 'start_time', e.target.value)}
                      className="h-10 text-sm"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={e => updateTime(slot.day_of_week, 'end_time', e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Not available</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Portfolio / Work Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-emerald-600" />
              Work Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Show clients the quality of your work. Upload before &amp; after photos, completed projects, etc.
            </p>

            {/* Image Grid */}
            {portfolioImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {portfolioImages.map(img => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img.image_url} alt={img.caption || 'Portfolio'} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handlePortfolioDelete(img.id, img.image_url)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="cursor-pointer">
              <div className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors",
                portfolioUploading ? "border-emerald-300 bg-emerald-50" : "border-border hover:border-emerald-400 hover:bg-emerald-50/50"
              )}>
                {portfolioUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                    <span className="text-sm font-medium text-emerald-700">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Add Photos</span>
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
            <p className="text-xs text-muted-foreground text-center">
              {portfolioImages.length}/12 photos &middot; Tap &amp; hold to remove
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Documents */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Get verified to appear higher in search results and earn more bookings.
            </p>
            <Link href="/worker-verification">
              <Button variant="outline" className="w-full gap-2">
                <ShieldCheck className="w-4 h-4" />
                Manage Verification
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error */}
      {error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-2xl mx-auto">
          <Button
            className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
