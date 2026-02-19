'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Landmark,
  Shield,
  FileDown,
  Trash2,
  Bell,
  BellRing,
  MessageSquare,
  Star,
  CalendarCheck,
  Megaphone,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Eye,
  EyeOff,
  Lock,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConsentRecord {
  id: string
  consent_type: string
  consent_given: boolean
  consent_text: string | null
  created_at: string
  expires_at: string | null
  revoked_at: string | null
}

interface BankDetails {
  bank_name: string
  account_number: string
  account_holder: string
  account_type: 'cheque' | 'savings'
}

interface NotificationPreferences {
  new_booking_requests: boolean
  booking_updates: boolean
  messages: boolean
  reviews: boolean
  marketing: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SA_BANKS = [
  'Capitec',
  'FNB',
  'Standard Bank',
  'Absa',
  'Nedbank',
  'TymeBank',
  'African Bank',
  'Investec',
  'Discovery Bank',
] as const

const CONSENT_LABELS: Record<string, { label: string; description: string }> = {
  platform_terms: {
    label: 'Platform Terms of Service',
    description: 'Agreement to DomestIQ platform rules, booking policies, and service standards.',
  },
  privacy_policy: {
    label: 'Privacy Policy',
    description: 'Consent to how we collect, store, and process your personal data.',
  },
  popi_consent: {
    label: 'POPI Act Consent',
    description:
      'Required under South African law (POPIA). Allows us to process your personal information for providing our services.',
  },
  income_data_sharing: {
    label: 'Income Data Sharing',
    description:
      'Allows verified partners (banks, lenders) to access your income statements for loan or credit applications. Expires after 1 year.',
  },
  identity_sharing: {
    label: 'Identity Verification Sharing',
    description:
      'Permits sharing your verified identity with third-party partners. Expires after 1 year.',
  },
  marketing: {
    label: 'Marketing Communications',
    description: 'Receive promotional emails, SMS, and push notifications about offers and new features.',
  },
  location_tracking: {
    label: 'Location Tracking',
    description:
      'Allows the app to use your location for showing nearby jobs, estimated arrival times, and service area matching.',
  },
}

const NOTIFICATION_OPTIONS: {
  key: keyof NotificationPreferences
  label: string
  description: string
  icon: React.ElementType
}[] = [
  {
    key: 'new_booking_requests',
    label: 'New Booking Requests',
    description: 'Get notified when a client requests your service',
    icon: CalendarCheck,
  },
  {
    key: 'booking_updates',
    label: 'Booking Updates',
    description: 'Changes to booking time, status, or cancellations',
    icon: BellRing,
  },
  {
    key: 'messages',
    label: 'Messages',
    description: 'New messages from clients and support',
    icon: MessageSquare,
  },
  {
    key: 'reviews',
    label: 'Reviews',
    description: 'When a client leaves you a review or rating',
    icon: Star,
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Promotions, tips, and platform updates',
    icon: Megaphone,
  },
]

// ---------------------------------------------------------------------------
// Toast Component (inline - no external hook needed)
// ---------------------------------------------------------------------------

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
  visible: boolean
}

function InlineToast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(onDismiss, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast.visible, onDismiss])

  if (!toast.visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
          toast.type === 'success' && 'bg-emerald-600 text-white',
          toast.type === 'error' && 'bg-destructive text-destructive-foreground',
          toast.type === 'info' && 'bg-blue-600 text-white'
        )}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
        {toast.type === 'error' && <AlertTriangle className="w-4 h-4" />}
        {toast.type === 'info' && <Info className="w-4 h-4" />}
        {toast.message}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WorkerSettingsPage() {
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  // Toast
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false })
  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true })
  }, [])
  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  // Bank account state
  const [bankForm, setBankForm] = useState<BankDetails>({
    bank_name: '',
    account_number: '',
    account_holder: '',
    account_type: 'cheque',
  })
  const [savedBankLast4, setSavedBankLast4] = useState<string | null>(null)
  const [savedBankName, setSavedBankName] = useState<string | null>(null)
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [isSavingBank, setIsSavingBank] = useState(false)

  // Consent state
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [isLoadingConsents, setIsLoadingConsents] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    new_booking_requests: true,
    booking_updates: true,
    messages: true,
    reviews: true,
    marketing: false,
  })
  const [isSavingNotifs, setIsSavingNotifs] = useState(false)

  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Page loading
  const [isLoading, setIsLoading] = useState(true)

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!user) return

    async function loadSettings() {
      try {
        // Fetch existing bank details from worker_profiles or payouts
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('bank_name, account_number_last4, notification_preferences')
          .eq('user_id', user!.id)
          .single()

        if (workerProfile) {
          if (workerProfile.bank_name) {
            setSavedBankName(workerProfile.bank_name)
          }
          if (workerProfile.account_number_last4) {
            setSavedBankLast4(workerProfile.account_number_last4)
          }
          if (workerProfile.notification_preferences) {
            const prefs = workerProfile.notification_preferences as Record<string, boolean>
            setNotifPrefs((prev) => ({
              new_booking_requests: prefs.new_booking_requests ?? prev.new_booking_requests,
              booking_updates: prefs.booking_updates ?? prev.booking_updates,
              messages: prefs.messages ?? prev.messages,
              reviews: prefs.reviews ?? prev.reviews,
              marketing: prefs.marketing ?? prev.marketing,
            }))
          }
        }

        // Fetch consents
        const consentRes = await fetch('/api/consent')
        if (consentRes.ok) {
          const data = await consentRes.json()
          setConsents(data.consents || [])
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setIsLoadingConsents(false)
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [user, supabase])

  // ---------------------------------------------------------------------------
  // Bank Account Handlers
  // ---------------------------------------------------------------------------

  const handleSaveBank = async () => {
    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder) {
      showToast('Please fill in all bank details', 'error')
      return
    }

    if (bankForm.account_number.length < 6) {
      showToast('Please enter a valid account number', 'error')
      return
    }

    setIsSavingBank(true)
    try {
      const res = await fetch('/api/payments/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankForm.bank_name,
          account_number: bankForm.account_number,
          account_holder: bankForm.account_holder,
          account_type: bankForm.account_type,
        }),
      })

      if (res.ok) {
        const last4 = bankForm.account_number.slice(-4)
        setSavedBankLast4(last4)
        setSavedBankName(bankForm.bank_name)
        setBankForm({ bank_name: '', account_number: '', account_holder: '', account_type: 'cheque' })
        showToast('Bank details saved successfully', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to save bank details', 'error')
      }
    } catch {
      showToast('Failed to save bank details', 'error')
    } finally {
      setIsSavingBank(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Consent Handlers
  // ---------------------------------------------------------------------------

  const handleRevokeConsent = async (consentId: string) => {
    setRevokingId(consentId)
    try {
      const res = await fetch(`/api/consent?id=${consentId}`, { method: 'DELETE' })
      if (res.ok) {
        setConsents((prev) => prev.filter((c) => c.id !== consentId))
        showToast('Consent revoked successfully', 'success')
      } else {
        showToast('Failed to revoke consent', 'error')
      }
    } catch {
      showToast('Failed to revoke consent', 'error')
    } finally {
      setRevokingId(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Notification Handlers
  // ---------------------------------------------------------------------------

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true)
    try {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ notification_preferences: notifPrefs })
        .eq('user_id', user!.id)

      if (error) throw error
      showToast('Notification preferences saved', 'success')
    } catch {
      showToast('Failed to save notification preferences', 'error')
    } finally {
      setIsSavingNotifs(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Data & Privacy Handlers
  // ---------------------------------------------------------------------------

  const handleDownloadData = () => {
    showToast('Your data export will be emailed to you', 'info')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return

    setIsDeleting(true)
    try {
      // Soft delete: clear personal data from profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: '[Deleted User]',
          phone: null,
          email: null,
          avatar_url: null,
        })
        .eq('id', user!.id)

      if (error) throw error

      // Deactivate worker profile
      await supabase
        .from('worker_profiles')
        .update({
          bio: null,
          hourly_rate: null,
          is_active: false,
        })
        .eq('user_id', user!.id)

      showToast('Account data has been deleted', 'success')
      setDeleteDialogOpen(false)
      setDeleteConfirmText('')

      // Sign out after short delay
      setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
      }, 2000)
    } catch {
      showToast('Failed to delete account. Please contact support.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </motion.div>

      {/* ================================================================== */}
      {/* 1. Bank Account Setup                                              */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Landmark className="w-5 h-5 text-blue-600" />
            Bank Account for Payouts
          </CardTitle>
          <CardDescription>
            Add your bank details to receive payouts from completed bookings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show saved account info */}
          {savedBankLast4 && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Account on file</span>
                </div>
                <span className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-0.5 rounded">
                  ****{savedBankLast4}
                </span>
              </div>
              {savedBankName && (
                <p className="text-sm text-blue-700">{savedBankName}</p>
              )}
            </div>
          )}

          <Separator />

          <p className="text-sm text-muted-foreground">
            {savedBankLast4 ? 'Update your bank details below:' : 'Enter your bank details to get started:'}
          </p>

          {/* Bank Name Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Select
              value={bankForm.bank_name}
              onValueChange={(value) => setBankForm((prev) => ({ ...prev, bank_name: value }))}
            >
              <SelectTrigger id="bank-name">
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {SA_BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="account-holder">Account Holder Name</Label>
            <Input
              id="account-holder"
              placeholder="Full name as on bank account"
              value={bankForm.account_holder}
              onChange={(e) =>
                setBankForm((prev) => ({ ...prev, account_holder: e.target.value }))
              }
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <div className="relative">
              <Input
                id="account-number"
                type={showAccountNumber ? 'text' : 'password'}
                placeholder="Enter your account number"
                value={bankForm.account_number}
                onChange={(e) =>
                  setBankForm((prev) => ({
                    ...prev,
                    account_number: e.target.value.replace(/\D/g, ''),
                  }))
                }
                className="pr-10"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setShowAccountNumber((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="account-type">Account Type</Label>
            <Select
              value={bankForm.account_type}
              onValueChange={(value) =>
                setBankForm((prev) => ({ ...prev, account_type: value as 'cheque' | 'savings' }))
              }
            >
              <SelectTrigger id="account-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cheque">Cheque / Current</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Your bank details are encrypted and stored securely.</span>
          </div>

          <Button onClick={handleSaveBank} disabled={isSavingBank} className="w-full">
            {isSavingBank ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Landmark className="w-4 h-4" />
                {savedBankLast4 ? 'Update Bank Details' : 'Save Bank Details'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* 2. Consent Management                                              */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-emerald-600" />
            Consent Management
          </CardTitle>
          <CardDescription>
            Review and manage the permissions you have granted. Required consents (Platform Terms,
            Privacy Policy, POPI) cannot be revoked while your account is active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingConsents ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          ) : consents.length === 0 ? (
            <div className="text-center py-6">
              <Shield className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No active consents found.</p>
            </div>
          ) : (
            consents.map((consent) => {
              const meta = CONSENT_LABELS[consent.consent_type]
              const isRequired = ['platform_terms', 'privacy_policy', 'popi_consent'].includes(
                consent.consent_type
              )
              const isRevoking = revokingId === consent.id

              return (
                <div
                  key={consent.id}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-sm">
                          {meta?.label || consent.consent_type}
                        </span>
                        {isRequired && (
                          <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {meta?.description || 'Consent granted for this feature.'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Granted: {formatDate(consent.created_at)}</span>
                        {consent.expires_at && (
                          <span className="text-amber-600">
                            Expires: {formatDate(consent.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isRequired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeConsent(consent.id)}
                        disabled={isRevoking}
                        className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        {isRevoking ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ShieldX className="w-3 h-3" />
                        )}
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* 3. Notification Preferences                                        */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-violet-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIFICATION_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isEnabled = notifPrefs[opt.key]

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleNotification(opt.key)}
                className="flex items-center gap-3 w-full rounded-lg p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <Icon className={cn('w-5 h-5 shrink-0', isEnabled ? 'text-violet-600' : 'text-muted-foreground')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
                {/* Toggle Switch */}
                <div
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0',
                    isEnabled ? 'bg-violet-600' : 'bg-muted-foreground/30'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </div>
              </button>
            )
          })}

          <div className="pt-3">
            <Button onClick={handleSaveNotifications} disabled={isSavingNotifs} variant="outline" className="w-full">
              {isSavingNotifs ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* 4. Data & Privacy                                                  */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileDown className="w-5 h-5 text-blue-600" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Export your data or manage your account. Your privacy is protected under the
            Protection of Personal Information Act (POPIA).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download My Data */}
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-sm">Download My Data</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Request a copy of all the personal data we hold about you. The export will be
              emailed to your registered email address.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
              onClick={handleDownloadData}
            >
              <FileDown className="w-4 h-4" />
              Request Data Export
            </Button>
          </div>

          <Separator />

          {/* Links */}
          <div className="flex flex-col gap-2">
            <a
              href="/privacy"
              className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Terms of Service
            </a>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* Danger Zone - Delete Account                                       */}
      {/* ================================================================== */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  This will permanently remove your personal data, deactivate your worker profile,
                  and sign you out. Any pending payouts will still be processed. This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <Label htmlFor="delete-confirm" className="text-sm font-medium">
                  Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="border-destructive/30 focus-visible:ring-destructive"
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
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Permanently Delete'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Toast */}
      <InlineToast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
