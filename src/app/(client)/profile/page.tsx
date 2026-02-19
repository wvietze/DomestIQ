'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  Camera, Save, Loader2, Trash2, AlertTriangle, CheckCircle2
} from 'lucide-react'

interface ProfileData {
  id: string
  full_name: string
  avatar_url: string | null
  email: string | null
  phone: string | null
}

interface ClientData {
  address: string | null
  suburb: string | null
  city: string | null
  province: string | null
}

export default function ClientProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, isLoading: userLoading } = useUser()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        const p = profile as unknown as ProfileData
        setProfileData(p)
        setFullName(p.full_name || '')
        setPhone(p.phone || '')
      }

      // Get client profile (address info)
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (clientProfile) {
        const cp = clientProfile as unknown as ClientData
        setAddress(cp.address || '')
        setSuburb(cp.suburb || '')
        setCity(cp.city || '')
        setProvince(cp.province || '')
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [supabase])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfileData(prev =>
        prev ? { ...prev, avatar_url: urlData.publicUrl } : null
      )
    } catch (err) {
      console.error('Failed to upload avatar:', err)
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update client profile address
      await supabase
        .from('client_profiles')
        .upsert({
          user_id: user.id,
          address: address || null,
          suburb: suburb || null,
          city: city || null,
          province: province || null,
        }, { onConflict: 'user_id' })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return
    setIsDeleting(true)

    try {
      // Soft delete: deactivate the user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Deleted User',
          avatar_url: null,
          phone: null,
          email: null,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Sign out
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Failed to delete account:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const initials = profileData?.full_name
    ? profileData.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profileData?.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <input
            type="file"
            ref={avatarInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">{profileData?.full_name}</p>
          <p className="text-sm text-muted-foreground">{profileData?.email}</p>
        </div>
      </div>

      {/* Personal Info */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="font-semibold">Personal Information</h2>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profileData?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+27 XX XXX XXXX"
              type="tel"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Info */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="font-semibold">Address</h2>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suburb">Suburb</Label>
            <Input
              id="suburb"
              value={suburb}
              onChange={e => setSuburb(e.target.value)}
              placeholder="Suburb"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={province}
                onChange={e => setProvince(e.target.value)}
                placeholder="Province"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving || !fullName.trim()}
        className="w-full h-12 text-lg gap-2"
      >
        {isSaving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : saveSuccess ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
      </Button>

      {/* Delete Account */}
      <Separator />

      <Card className="border-destructive/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-semibold text-destructive">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Deleting your account will deactivate your profile and remove your personal data.
            This action cannot be easily undone.
          </p>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This will deactivate your account and remove your personal information.
                  Any active bookings will be cancelled. Type <strong>DELETE</strong> to confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label>Type DELETE to confirm</Label>
                <Input
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false)
                    setDeleteConfirmText('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Delete My Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
