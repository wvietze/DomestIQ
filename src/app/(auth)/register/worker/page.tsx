'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
function Icon({ name, className = '' }: { name: string; className?: string }) {
 return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}
import { cn } from '@/lib/utils'
import { WaveBars } from '@/components/loading'
import { SA_CITIES, type SACity } from '@/lib/data/sa-cities'
import { CitySelector } from '@/components/worker/city-selector'
import { reverseGeocode } from '@/lib/maps/geocoding'

const SERVICE_OPTIONS: Array<{ id: string; name: string; icon: string }> = [
 { id: 'domestic-worker', name: 'Domestic Worker', icon: 'home' },
 { id: 'gardener', name: 'Gardener', icon: 'yard' },
 { id: 'painter', name: 'Painter', icon: 'format_paint' },
 { id: 'welder', name: 'Welder', icon: 'local_fire_department' },
 { id: 'electrician', name: 'Electrician', icon: 'electrical_services' },
 { id: 'plumber', name: 'Plumber', icon: 'plumbing' },
 { id: 'carpenter', name: 'Carpenter', icon: 'handyman' },
 { id: 'tiler', name: 'Tiler', icon: 'grid_view' },
 { id: 'roofer', name: 'Roofer', icon: 'roofing' },
 { id: 'pool-cleaner', name: 'Pool Cleaner', icon: 'pool' },
 { id: 'pest-control', name: 'Pest Control', icon: 'pest_control' },
 { id: 'window-cleaner', name: 'Window Cleaner', icon: 'window' },
 { id: 'handyman', name: 'Handyman', icon: 'construction' },
 { id: 'babysitter', name: 'Babysitter', icon: 'child_care' },
 { id: 'dog-walker', name: 'Dog Walker', icon: 'pets' },
 { id: 'security', name: 'Security', icon: 'security' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TOTAL_STEPS = 7

export default function WorkerRegisterPage() {
 const router = useRouter()
 const supabase = createClient()
 const [step, setStep] = useState(0)
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState('')

 // Step 1: Auth (phone or email)
 const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
 const [phone, setPhone] = useState('')
 const [otpSent, setOtpSent] = useState(false)
 const [otp, setOtp] = useState('')
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')

 // Step 2: Name + Photo
 const [fullName, setFullName] = useState('')
 const [avatarFile, setAvatarFile] = useState<File | null>(null)
 const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

 // Step 3: Services
 const [selectedServices, setSelectedServices] = useState<string[]>([])

 // Step 4: Availability
 const [availableDays, setAvailableDays] = useState<number[]>([1, 2, 3, 4, 5])

 // Step 5: Location
 const [selectedCities, setSelectedCities] = useState<string[]>([])
 const [locationLat, setLocationLat] = useState<number | null>(null)
 const [locationLng, setLocationLng] = useState<number | null>(null)
 const [locationName, setLocationName] = useState('')
 const [locationDetecting, setLocationDetecting] = useState(false)

 // Step 6: Documents
 const [idDocument, setIdDocument] = useState<File | null>(null)

 // Referral Code (optional, entered in Step 1)
 const [referralCode, setReferralCode] = useState('')

 // Step 7: Consent
 const [popiConsent, setPopiConsent] = useState(false)
 const [termsConsent, setTermsConsent] = useState(false)

 // Auto-save to localStorage
 useEffect(() => {
 const saved = localStorage.getItem('worker-registration')
 if (saved) {
 try {
 const data = JSON.parse(saved)
 if (data.fullName) setFullName(data.fullName)
 if (data.selectedServices) setSelectedServices(data.selectedServices)
 if (data.availableDays) setAvailableDays(data.availableDays)
 if (data.selectedCities) setSelectedCities(data.selectedCities)
 if (data.referralCode) setReferralCode(data.referralCode)
 if (data.step) setStep(data.step)
 } catch { /* ignore */ }
 }
 }, [])

 useEffect(() => {
 localStorage.setItem('worker-registration', JSON.stringify({
 fullName, selectedServices, availableDays, selectedCities, referralCode, step
 }))
 }, [fullName, selectedServices, availableDays, selectedCities, referralCode, step])

 const handleSendOtp = async () => {
 setError('')
 setIsLoading(true)
 try {
 const formattedPhone = phone.startsWith('+') ? phone : `+27${phone.replace(/^0/, '')}`
 const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
 if (error) throw error
 setOtpSent(true)
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to send OTP')
 } finally {
 setIsLoading(false)
 }
 }

 const handleVerifyOtp = async () => {
 setError('')
 setIsLoading(true)
 try {
 const formattedPhone = phone.startsWith('+') ? phone : `+27${phone.replace(/^0/, '')}`
 const { error } = await supabase.auth.verifyOtp({
 phone: formattedPhone,
 token: otp,
 type: 'sms',
 })
 if (error) throw error
 setStep(1)
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Invalid OTP')
 } finally {
 setIsLoading(false)
 }
 }

 const handleEmailSignUp = async () => {
 setError('')
 if (password.length < 6) {
 setError('Password must be at least 6 characters')
 return
 }
 setIsLoading(true)
 try {
 const { data, error } = await supabase.auth.signUp({
 email,
 password,
 options: { data: { full_name: '', role: 'worker' } },
 })
 if (error) throw error
 if (!data.user) throw new Error('Signup failed')
 setStep(1)
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Signup failed')
 } finally {
 setIsLoading(false)
 }
 }

 const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (file) {
 setAvatarFile(file)
 const reader = new FileReader()
 reader.onloadend = () => setAvatarPreview(reader.result as string)
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

 const detectLocation = () => {
 if (!navigator.geolocation) {
 setError('Location not supported on this device')
 return
 }
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
 const name = [result.suburb, result.city].filter(Boolean).join(', ') || result.formattedAddress
 setLocationName(name)
 } else {
 setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
 }
 } catch {
 setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
 }
 setLocationDetecting(false)
 },
 () => {
 setError('Could not detect location. Please select cities instead.')
 setLocationDetecting(false)
 },
 { enableHighAccuracy: true, timeout: 10000 }
 )
 }

 const toggleCity = (city: SACity) => {
 setSelectedCities(prev =>
 prev.includes(city.name) ? prev.filter(c => c !== city.name) : prev.length < 10 ? [...prev, city.name] : prev
 )
 }

 const handleComplete = async () => {
 setError('')
 setIsLoading(true)
 try {
 const { data: { user } } = await supabase.auth.getUser()
 if (!user) throw new Error('Not authenticated')

 // Update profile
 await supabase.from('profiles').upsert({
 id: user.id,
 role: 'worker' as const,
 full_name: fullName,
 email: email || undefined,
 phone: phone ? (phone.startsWith('+') ? phone : `+27${phone.replace(/^0/, '')}`) : undefined,
 popi_consent: popiConsent,
 preferred_language: 'en',
 })

 // Upload avatar
 let avatarUrl = null
 if (avatarFile) {
 const ext = avatarFile.name.split('.').pop()
 const path = `${user.id}/avatar.${ext}`
 await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
 const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
 avatarUrl = urlData.publicUrl
 await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id)
 }

 // Create worker profile
 const { data: workerProfile } = await supabase.from('worker_profiles').insert({
 user_id: user.id,
 location_lat: locationLat,
 location_lng: locationLng,
 location_name: locationName || null,
 profile_completeness: calculateCompleteness(),
 }).select().single()

 if (workerProfile) {
 // Get service IDs and link them
 const { data: services } = await supabase
 .from('services')
 .select('id, name')

 if (services) {
 const serviceLinks = selectedServices
 .map(sId => {
 const svc = services.find(s =>
 s.name.toLowerCase().replace(/\s+/g, '-') === sId
 )
 return svc ? { worker_id: workerProfile.id, service_id: svc.id } : null
 })
 .filter(Boolean)

 if (serviceLinks.length > 0) {
 await supabase.from('worker_services').insert(serviceLinks)
 }
 }

 // Set availability
 const availabilityRecords = availableDays.map(day => ({
 worker_id: workerProfile.id,
 day_of_week: day,
 is_available: true,
 start_time: '08:00',
 end_time: '17:00',
 }))
 if (availabilityRecords.length > 0) {
 await supabase.from('worker_availability').insert(availabilityRecords)
 }

 // Save service areas from selected cities
 if (selectedCities.length > 0) {
 const areaRecords = selectedCities.map(cityName => {
 const cityData = SA_CITIES.find(c => c.name === cityName)
 return cityData ? {
 worker_id: workerProfile.id,
 area_name: cityData.name,
 center_lat: cityData.lat,
 center_lng: cityData.lng,
 radius_km: 25,
 } : null
 }).filter(Boolean)
 if (areaRecords.length > 0) {
 await supabase.from('worker_service_areas').insert(areaRecords)
 }
 }
 }

 // Upload ID document
 if (idDocument) {
 const ext = idDocument.name.split('.').pop()
 const path = `${user.id}/id-document.${ext}`
 await supabase.storage.from('documents').upload(path, idDocument)
 const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
 await supabase.from('documents').insert({
 user_id: user.id,
 document_type: 'id_document',
 file_url: urlData.publicUrl,
 file_name: idDocument.name,
 })
 }

 // Record consent
 if (popiConsent) {
 await supabase.from('consent_records').insert({
 user_id: user.id,
 consent_type: 'popi',
 consent_given: true,
 consent_text: 'POPI Act consent for data processing',
 })
 }

 // Record referral if a code was provided
 if (referralCode.trim()) {
 try {
 await fetch('/api/referrals', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 referral_code: referralCode.trim(),
 referred_user_id: user.id,
 }),
 })
 } catch {
 // Referral recording is non-critical, don't block registration
 }
 }

 localStorage.removeItem('worker-registration')
 router.push('/worker-onboarding')
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Registration failed')
 } finally {
 setIsLoading(false)
 }
 }

 const calculateCompleteness = () => {
 let score = 0
 if (fullName) score += 15
 if (avatarFile) score += 20
 if (selectedServices.length > 0) score += 20
 if (availableDays.length > 0) score += 15
 if (selectedCities.length > 0 || locationLat) score += 15
 if (idDocument) score += 10
 if (popiConsent) score += 5
 return score
 }

 const canProceed = () => {
 switch (step) {
 case 0: return authMethod === 'email' ? (email.includes('@') && password.length >= 6) : (otpSent ? otp.length >= 4 : phone.length >= 9)
 case 1: return fullName.length >= 2
 case 2: return selectedServices.length > 0
 case 3: return availableDays.length > 0
 case 4: return selectedCities.length > 0 || locationLat !== null
 case 5: return true // Documents optional
 case 6: return popiConsent && termsConsent
 default: return false
 }
 }

 const renderStep = () => {
 switch (step) {
 case 0:
 return (
 <div className="space-y-6">
 <div className="text-center space-y-2">
 <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
 {authMethod === 'email' ? <Icon name="mail" className="text-3xl text-[#005d42]"/> : <Icon name="phone" className="text-3xl text-[#005d42]"/>}
 </div>
 <h2 className="text-2xl font-bold">Create Your Account</h2>
 <p className="text-muted-foreground">Sign up to get started</p>
 </div>

 {/* Auth method toggle */}
 <div className="flex rounded-lg border overflow-hidden">
 <button
 onClick={() => setAuthMethod('email')}
 className={cn(
"flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
 authMethod === 'email' ?"bg-primary text-primary-foreground":"bg-muted/50 text-muted-foreground"
 )}
 >
 <Icon name="mail" className="text-base"/> Email
 </button>
 <button
 onClick={() => setAuthMethod('phone')}
 className={cn(
"flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
 authMethod === 'phone' ?"bg-primary text-primary-foreground":"bg-muted/50 text-muted-foreground"
 )}
 >
 <Icon name="phone" className="text-base"/> WhatsApp / Phone
 </button>
 </div>

 {authMethod === 'email' ? (
 <div className="space-y-4">
 <Input
 type="email"
 placeholder="Email address"
 value={email}
 onChange={e => setEmail(e.target.value)}
 className="text-lg h-14"
 autoComplete="email"
 />
 <Input
 type="password"
 placeholder="Create password (min 6 chars)"
 value={password}
 onChange={e => setPassword(e.target.value)}
 className="text-lg h-14"
 autoComplete="new-password"
 minLength={6}
 />
 <Button onClick={handleEmailSignUp} disabled={isLoading || !email.includes('@') || password.length < 6} className="w-full h-14 text-lg">
 {isLoading ? <WaveBars size="sm"/> : null}
 Sign Up
 </Button>
 </div>
 ) : (
 <>
 {!otpSent ? (
 <div className="space-y-4">
 <div className="flex gap-2">
 <div className="flex items-center px-3 bg-muted rounded-lg text-sm font-medium">+27</div>
 <Input
 type="tel"
 placeholder="Phone number"
 value={phone}
 onChange={e => setPhone(e.target.value)}
 className="text-lg h-14"
 />
 </div>
 <Button onClick={handleSendOtp} disabled={isLoading || phone.length < 9} className="w-full h-14 text-lg">
 {isLoading ? <WaveBars size="sm"/> : null}
 Send Code
 </Button>
 <p className="text-xs text-muted-foreground text-center">
 WhatsApp OTP coming soon. Use email for now.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 <Input
 type="text"
 inputMode="numeric"
 placeholder="Enter 6-digit code"
 value={otp}
 onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
 className="text-center text-2xl tracking-widest h-16"
 maxLength={6}
 />
 <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length < 4} className="w-full h-14 text-lg">
 {isLoading ? <WaveBars size="sm"/> : null}
 Verify
 </Button>
 <button onClick={() => setOtpSent(false)} className="text-sm text-primary w-full text-center">
 Change number
 </button>
 </div>
 )}
 </>
 )}
 <div className="pt-2 border-t border-border">
 <Input
 placeholder="Got a referral code? (optional)"
 value={referralCode}
 onChange={e => setReferralCode(e.target.value.toUpperCase().slice(0, 10))}
 className="text-center tracking-wider h-12"
 maxLength={10}
 />
 </div>
 </div>
 )

 case 1:
 return (
 <div className="space-y-6">
 <div className="text-center space-y-2">
 <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
 <Icon name="person" className="text-3xl text-[#005d42]"/>
 </div>
 <h2 className="text-2xl font-bold">About You</h2>
 <p className="text-muted-foreground">Your name and photo</p>
 </div>
 <div className="space-y-4">
 <Input
 placeholder="Your full name"
 value={fullName}
 onChange={e => setFullName(e.target.value)}
 className="text-lg h-14"
 />
 <div className="flex flex-col items-center gap-3">
 {avatarPreview ? (
 <div className="relative w-32 h-32 rounded-full overflow-hidden">
 <Image src={avatarPreview} alt="Profile" width={128} height={128} unoptimized className="w-full h-full object-cover"/>
 </div>
 ) : (
 <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
 <Icon name="photo_camera" className="text-4xl text-[#6e7a73]"/>
 </div>
 )}
 <label className="cursor-pointer">
 <input type="file"accept="image/*"capture="user"className="hidden"onChange={handlePhotoCapture} />
 <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
 <Icon name="photo_camera" className="text-base"/>
 {avatarPreview ? 'Change Photo' : 'Take Photo'}
 </span>
 </label>
 </div>
 </div>
 </div>
 )

 case 2:
 return (
 <div className="space-y-6">
 <div className="text-center space-y-2">
 <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
 <Icon name="handyman" className="text-3xl text-[#005d42]"/>
 </div>
 <h2 className="text-2xl font-bold">Your Services</h2>
 <p className="text-muted-foreground">Tap to select what you do</p>
 </div>
 <div className="grid grid-cols-3 gap-3">
 {SERVICE_OPTIONS.map(svc => {
 const selected = selectedServices.includes(svc.id)
 return (
 <button
 key={svc.id}
 onClick={() => toggleService(svc.id)}
 className={cn(
"flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-[0.98]",
 selected
 ?"border-[#005d42] bg-[#9ffdd3]/30 text-[#005d42]"
 :"border-[#bdc9c1] bg-white hover:border-[#005d42]/50"
 )}
 >
 <Icon name={svc.icon} className="text-3xl"/>
 <span className="text-xs font-medium text-center leading-tight">{svc.name}</span>
 {selected && <Icon name="check_circle" className="text-base"/>}
 </button>
 )
 })}
 </div>
 </div>
 )

 case 3:
 return (
 <div className="space-y-6">
 <div className="text-center space-y-2">
 <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
 <Icon name="check_circle" className="text-3xl text-[#005d42]"/>
 </div>
 <h2 className="text-2xl font-bold">Availability</h2>
 <p className="text-muted-foreground">Tap the days you can work</p>
 </div>
 <div className="grid grid-cols-7 gap-2">
 {DAYS.map((day, idx) => (
 <button
 key={day}
 onClick={() => toggleDay(idx)}
 className={cn(
"flex flex-col items-center p-4 rounded-xl border-2 transition-all",
 availableDays.includes(idx)
 ?"border-primary bg-primary/10 text-primary font-bold"
 :"border-border bg-card"
 )}
 >
 <span className="text-sm font-medium">{day}</span>
 </button>
 ))}
 </div>
 <p className="text-sm text-muted-foreground text-center">
 Default hours: 8:00 AM - 5:00 PM (you can change this later)
 </p>
 </div>
 )

 case 4:
 return (
 <div className="space-y-6">
 <div className="text-center space-y-2">
 <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
 <Icon name="location_on" className="text-3xl text-[#005d42]"/>
 </div>
 <h2 className="text-2xl font-bold">Your Work Areas</h2>
 <p className="text-muted-foreground">Select cities where you work or detect your GPS location</p>
 </div>
 <div className="space-y-4">
 {/* GPS Detect */}
 <Button
 variant="outline"
 onClick={detectLocation}
 disabled={locationDetecting}
 className="w-full h-12 text-base gap-2"
 >
 {locationDetecting ? (
 <Icon name="progress_activity" className="text-base animate-spin"/>
 ) : (
 <Icon name="navigation" className="text-base"/>
 )}
 {locationLat ? 'Re-detect Location' : 'Detect My Location'}
 </Button>
 {locationLat && locationName && (
 <div className="rounded-lg bg-[#9ffdd3]/30 border border-[#97f5cc] p-3">
 <div className="flex items-center gap-2">
 <Icon name="check_circle" className="text-base text-[#005d42] shrink-0"/>
 <p className="text-sm font-medium text-[#005d42]">{locationName}</p>
 </div>
 </div>
 )}

 <div className="relative">
 <div className="absolute inset-0 flex items-center"><span className="w-full border-t"/></div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="bg-background px-2 text-muted-foreground">select your cities</span>
 </div>
 </div>

 <CitySelector
 selectedCities={selectedCities}
 onToggleCity={toggleCity}
 maxCities={10}
 />
 </div>
 </div>
 )

 case 5:
 return (
 <div className="space-y-6">
 <div className="text-center space-y-2">
 <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
 <Icon name="description" className="text-3xl text-[#005d42]"/>
 </div>
 <h2 className="text-2xl font-bold">Documents</h2>
 <p className="text-muted-foreground">Optional - upload for verification</p>
 </div>
 <div className="space-y-4">
 <Card>
 <CardContent className="p-4">
 <label className="cursor-pointer flex items-center gap-4">
 <div className={cn(
"w-12 h-12 rounded-lg flex items-center justify-center",
 idDocument ?"bg-secondary/10":"bg-muted"
 )}>
 {idDocument ? (
 <Icon name="check_circle" className="text-2xl text-[#904d00]"/>
 ) : (
 <Icon name="description" className="text-2xl text-[#6e7a73]"/>
 )}
 </div>
 <div className="flex-1">
 <p className="font-medium">SA ID Document</p>
 <p className="text-sm text-muted-foreground">
 {idDocument ? idDocument.name : 'Photo of your ID'}
 </p>
 </div>
 <input
 type="file"
 accept="image/*"
 capture="environment"
 className="hidden"
 onChange={e => setIdDocument(e.target.files?.[0] || null)}
 />
 <span className="text-primary text-sm font-medium">
 {idDocument ? 'Change' : 'Upload'}
 </span>
 </label>
 </CardContent>
 </Card>
 <p className="text-xs text-muted-foreground text-center">
 Documents are kept private and used only for verification
 </p>
 </div>
 </div>
 )

 case 6:
 return (
 <div className="space-y-6">
 <div className="text-center space-y-2">
 <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
 <Icon name="shield" className="text-3xl text-[#005d42]"/>
 </div>
 <h2 className="text-2xl font-bold">Almost Done!</h2>
 <p className="text-muted-foreground">Please review and agree</p>
 </div>
 <div className="space-y-4">
 <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer">
 <input
 type="checkbox"
 checked={popiConsent}
 onChange={e => setPopiConsent(e.target.checked)}
 className="mt-1 w-5 h-5 rounded border-border"
 />
 <div>
 <p className="font-medium">Privacy Consent (POPI Act)</p>
 <p className="text-sm text-muted-foreground">
 I consent to the collection, processing, and storage of my personal information as described in the{' '}
 <a href="/privacy"className="text-primary underline"target="_blank">Privacy Policy</a>.
 </p>
 </div>
 </label>
 <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer">
 <input
 type="checkbox"
 checked={termsConsent}
 onChange={e => setTermsConsent(e.target.checked)}
 className="mt-1 w-5 h-5 rounded border-border"
 />
 <div>
 <p className="font-medium">Terms of Service</p>
 <p className="text-sm text-muted-foreground">
 I agree to the{' '}
 <a href="/terms"className="text-primary underline"target="_blank">Terms of Service</a>.
 DomestIQ is a matching platform only.
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
 <div className="min-h-screen bg-background flex flex-col">
 {/* Progress Dots */}
 <div className="flex items-center justify-center gap-2 py-4 px-4">
 {Array.from({ length: TOTAL_STEPS }, (_, i) => (
 <div
 key={i}
 className={cn(
"h-2 rounded-full transition-all",
 i === step ?"w-8 bg-primary": i < step ?"w-2 bg-primary":"w-2 bg-border"
 )}
 />
 ))}
 </div>

 {/* Content */}
 <div className="flex-1 px-4 pb-24 max-w-md mx-auto w-full">
 <AnimatePresence mode="wait">
 <motion.div
 key={step}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.2 }}
 >
 {renderStep()}
 </motion.div>
 </AnimatePresence>

 {error && (
 <p className="text-destructive text-sm text-center mt-4">{error}</p>
 )}
 </div>

 {/* Bottom Navigation */}
 {step > 0 && (
 <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
 <div className="max-w-md mx-auto flex gap-3">
 <Button
 variant="outline"
 onClick={() => setStep(s => s - 1)}
 className="h-14 px-6"
 >
 <Icon name="chevron_left" className="text-xl"/>
 Back
 </Button>
 <Button
 onClick={() => {
 if (step === TOTAL_STEPS - 1) {
 handleComplete()
 } else {
 setStep(s => s + 1)
 }
 }}
 disabled={!canProceed() || isLoading}
 className="flex-1 h-14 text-lg"
 >
 {isLoading ? (
 <WaveBars size="sm"/>
 ) : null}
 {step === TOTAL_STEPS - 1 ? 'Complete' : 'Next'}
 {step < TOTAL_STEPS - 1 && <Icon name="chevron_right" className="text-xl"/>}
 </Button>
 </div>
 </div>
 )}
 </div>
 )
}
