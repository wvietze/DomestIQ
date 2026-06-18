'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useTranslation } from '@/lib/hooks/use-translation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { WaveBars } from '@/components/loading'
import { useLanguageStore } from '@/lib/stores/language-store'
import { cn } from '@/lib/utils'

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
    label: 'Work Data Sharing',
    description:
      'Allows approved third parties to verify your work history when you give explicit consent. Expires after 1 year.',
  },
  identity_sharing: {
    label: 'Identity Verification Sharing',
    description:
      'Permits sharing your verified identity status with approved third parties when you give explicit consent. Expires after 1 year.',
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
  icon: string
}[] = [
  {
    key: 'new_booking_requests',
    label: 'New Booking Requests',
    description: 'Get notified when a client requests your service',
    icon: 'calendar_month',
  },
  {
    key: 'booking_updates',
    label: 'Booking Updates',
    description: 'Changes to booking time, status, or cancellations',
    icon: 'notifications_active',
  },
  {
    key: 'messages',
    label: 'Messages',
    description: 'New messages from clients and support',
    icon: 'chat',
  },
  {
    key: 'reviews',
    label: 'Reviews',
    description: 'When a client leaves you a review or rating',
    icon: 'star',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Promotions, tips, and platform updates',
    icon: 'campaign',
  },
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zu', label: 'isiZulu' },
  { code: 'xh', label: 'isiXhosa' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'st', label: 'Sesotho' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'tn', label: 'Setswana' },
  { code: 'ts', label: 'Xitsonga' },
  { code: 've', label: 'Tshivenda' },
  { code: 'ss', label: 'siSwati' },
  { code: 'nr', label: 'isiNdebele' },
] as const

// ---------------------------------------------------------------------------
// Toast Component
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
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60]">
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300',
          toast.type === 'success' && 'bg-[#005d42] text-white',
          toast.type === 'error' && 'bg-[#ba1a1a] text-white',
          toast.type === 'info' && 'bg-[#1a1c1b] text-white'
        )}
      >
        <span className="material-symbols-outlined text-[18px]">
          {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
        </span>
        {toast.message}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reusable row components
// ---------------------------------------------------------------------------

function SectionHeader({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <h2
      className={cn(
        'text-[11px] font-bold tracking-[0.1em] mb-3 px-1',
        danger ? 'text-[#ba1a1a]' : 'text-[#3e4943]'
      )}
    >
      {children}
    </h2>
  )
}

function SettingsRow({
  icon,
  label,
  subtitle,
  onClick,
  danger,
  trailing,
}: {
  icon: string
  label: string
  subtitle?: string
  onClick?: () => void
  danger?: boolean
  trailing?: React.ReactNode
}) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-lg bg-white flex items-center justify-center',
            danger ? 'text-[#ba1a1a]' : 'text-[#005d42]'
          )}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className={cn('text-[15px] font-semibold', danger ? 'text-[#ba1a1a]' : 'text-[#1a1c1b]')}>
            {label}
          </p>
          {subtitle && <p className="text-[13px] text-[#3e4943]">{subtitle}</p>}
        </div>
      </div>
      {trailing ?? (
        <span className={cn('material-symbols-outlined', danger ? 'text-[#ba1a1a]/40' : 'text-[#bdc9c1]')}>
          chevron_right
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors duration-200',
          danger ? 'hover:bg-[#ffdad6]/20' : 'hover:bg-[#e8e8e6]'
        )}
      >
        {content}
      </button>
    )
  }

  return <div className="w-full flex items-center justify-between p-4">{content}</div>
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0',
        checked ? 'bg-[#047857]' : 'bg-[#e2e3e1]'
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WorkerSettingsPage() {
  const { user, isLoading: userLoading } = useUser()
  const { t, language } = useTranslation()
  const router = useRouter()
  const supabase = createClient()

  // Toast
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false })
  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true })
  }, [])
  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  // Panel state — which sub-panel is open
  const [activePanel, setActivePanel] = useState<
    'none' | 'notifications' | 'language' | 'consent' | 'visibility'
  >('none')

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

  // Profile visibility state
  const [profileVisible, setProfileVisible] = useState(true)
  const [, setIsSavingVisibility] = useState(false)

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
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('notification_preferences, is_active')
          .eq('user_id', user!.id)
          .single()

        if (workerProfile) {
          if (typeof workerProfile.is_active === 'boolean') {
            setProfileVisible(workerProfile.is_active)
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
      setActivePanel('none')
    } catch {
      showToast('Failed to save notification preferences', 'error')
    } finally {
      setIsSavingNotifs(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Visibility Handler
  // ---------------------------------------------------------------------------

  const handleToggleVisibility = async () => {
    const newValue = !profileVisible
    setProfileVisible(newValue)
    setIsSavingVisibility(true)
    try {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ is_active: newValue })
        .eq('user_id', user!.id)

      if (error) throw error
      showToast(newValue ? 'Profile is now visible' : 'Profile is now hidden', 'success')
    } catch {
      setProfileVisible(!newValue)
      showToast('Failed to update visibility', 'error')
    } finally {
      setIsSavingVisibility(false)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
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

  const currentLanguageLabel = LANGUAGES.find((l) => l.code === language)?.label ?? 'English'

  const notifSummary = (() => {
    const enabledCount = Object.values(notifPrefs).filter(Boolean).length
    if (enabledCount === NOTIFICATION_OPTIONS.length) return 'All enabled'
    if (enabledCount === 0) return 'All disabled'
    return `${enabledCount} of ${NOTIFICATION_OPTIONS.length} enabled`
  })()

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (userLoading || isLoading) {
    return (
      <div className="px-6 pt-2 pb-32 space-y-8">
        <div className="h-5 w-24 bg-[#e8e8e6] rounded animate-pulse" />
        <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-[#e8e8e6] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[#e8e8e6] rounded animate-pulse" />
                <div className="h-3 w-20 bg-[#e8e8e6] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-5 w-20 bg-[#e8e8e6] rounded animate-pulse" />
        <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-[#e8e8e6] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-[#e8e8e6] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Sub-panel: Notifications
  // ---------------------------------------------------------------------------

  if (activePanel === 'notifications') {
    return (
      <div className="min-h-screen bg-[#f9f9f7]">
        <div className="sticky top-0 z-40 bg-[#f9f9f7] flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => setActivePanel('none')}
            className="p-2 -ml-2 hover:bg-[#e8e8e6] transition-colors duration-200 rounded-full"
          >
            <span className="material-symbols-outlined text-[#005d42]">arrow_back</span>
          </button>
          <h1 className="font-heading font-bold text-lg tracking-tight text-[#005d42]">Notification Preferences</h1>
        </div>

        <div className="px-6 pb-32 space-y-6">
          <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
            {NOTIFICATION_OPTIONS.map((opt) => {
              const isEnabled = notifPrefs[opt.key]
              return (
                <div key={opt.key} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-white flex items-center justify-center transition-colors duration-200',
                      isEnabled ? 'text-[#005d42]' : 'text-[#6e7a73]'
                    )}>
                      <span className="material-symbols-outlined">{opt.icon}</span>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#1a1c1b]">{opt.label}</p>
                      <p className="text-[13px] text-[#3e4943]">{opt.description}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={isEnabled} onChange={() => toggleNotification(opt.key)} />
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSaveNotifications}
            disabled={isSavingNotifs}
            className="w-full flex items-center justify-center gap-2 bg-[#005d42] text-white font-semibold py-3.5 rounded-xl hover:bg-[#047857] transition-colors duration-200 disabled:opacity-60"
          >
            {isSavingNotifs ? (
              <><WaveBars size="sm" /> Saving...</>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>

        <InlineToast toast={toast} onDismiss={dismissToast} />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Sub-panel: Language
  // ---------------------------------------------------------------------------

  if (activePanel === 'language') {
    return (
      <div className="min-h-screen bg-[#f9f9f7]">
        <div className="sticky top-0 z-40 bg-[#f9f9f7] flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => setActivePanel('none')}
            className="p-2 -ml-2 hover:bg-[#e8e8e6] transition-colors duration-200 rounded-full"
          >
            <span className="material-symbols-outlined text-[#005d42]">arrow_back</span>
          </button>
          <h1 className="font-heading font-bold text-lg tracking-tight text-[#005d42]">Language</h1>
        </div>

        <div className="px-6 pb-32">
          <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
            {LANGUAGES.map((lang) => {
              const isActive = language === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    useLanguageStore.getState().setLanguage(lang.code)
                    showToast(`Language changed to ${lang.label}`, 'success')
                  }}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#e8e8e6] transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-white flex items-center justify-center',
                      isActive ? 'text-[#005d42]' : 'text-[#6e7a73]'
                    )}>
                      <span className="material-symbols-outlined">
                        {isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <p className={cn(
                      'text-[15px] font-semibold',
                      isActive ? 'text-[#005d42]' : 'text-[#1a1c1b]'
                    )}>
                      {lang.label}
                    </p>
                  </div>
                  {isActive && (
                    <span className="material-symbols-outlined text-[#005d42]">check</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <InlineToast toast={toast} onDismiss={dismissToast} />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Sub-panel: POPIA Consent
  // ---------------------------------------------------------------------------

  if (activePanel === 'consent') {
    return (
      <div className="min-h-screen bg-[#f9f9f7]">
        <div className="sticky top-0 z-40 bg-[#f9f9f7] flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => setActivePanel('none')}
            className="p-2 -ml-2 hover:bg-[#e8e8e6] transition-colors duration-200 rounded-full"
          >
            <span className="material-symbols-outlined text-[#005d42]">arrow_back</span>
          </button>
          <h1 className="font-heading font-bold text-lg tracking-tight text-[#005d42]">POPIA Consent</h1>
        </div>

        <div className="px-6 pb-32 space-y-4">
          <p className="text-[13px] text-[#3e4943] px-1">
            Review and manage the permissions you have granted. Required consents cannot be revoked while your account is active.
          </p>

          {isLoadingConsents ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#f4f4f2] rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-40 bg-[#e8e8e6] rounded mb-2" />
                  <div className="h-3 w-56 bg-[#e8e8e6] rounded" />
                </div>
              ))}
            </div>
          ) : consents.length === 0 ? (
            <div className="bg-[#f4f4f2] rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-[40px] text-[#bdc9c1] mb-2">policy</span>
              <p className="text-[13px] text-[#6e7a73]">No active consents found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consents.map((consent) => {
                const meta = CONSENT_LABELS[consent.consent_type]
                const isRequired = ['platform_terms', 'privacy_policy', 'popi_consent'].includes(
                  consent.consent_type
                )
                const isRevoking = revokingId === consent.id

                return (
                  <div key={consent.id} className="bg-[#f4f4f2] rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="material-symbols-outlined text-[18px] text-[#005d42]">verified_user</span>
                          <span className="text-[15px] font-semibold text-[#1a1c1b]">
                            {meta?.label || consent.consent_type}
                          </span>
                          {isRequired && (
                            <span className="text-[10px] font-bold bg-[#904d00]/15 text-[#904d00] px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-[#3e4943] mt-1">
                          {meta?.description || 'Consent granted for this feature.'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[12px] text-[#6e7a73]">
                          <span>Granted: {formatDate(consent.created_at)}</span>
                          {consent.expires_at && (
                            <span className="text-[#904d00]">
                              Expires: {formatDate(consent.expires_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isRequired && (
                      <button
                        onClick={() => handleRevokeConsent(consent.id)}
                        disabled={isRevoking}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/30 px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        {isRevoking ? (
                          <WaveBars size="sm" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">remove_circle</span>
                        )}
                        Revoke
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <InlineToast toast={toast} onDismiss={dismissToast} />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Main Settings List
  // ---------------------------------------------------------------------------

  return (
    <div className="px-6 pt-2 pb-32">
      {/* ACCOUNT Section */}
      <section className="mb-8">
        <SectionHeader>ACCOUNT</SectionHeader>
        <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
          <SettingsRow
            icon="notifications"
            label={t('settings.notifications', 'Notification Preferences')}
            subtitle={notifSummary}
            onClick={() => setActivePanel('notifications')}
          />
          <SettingsRow
            icon="language"
            label={t('settings.language', 'Language')}
            subtitle={currentLanguageLabel}
            onClick={() => setActivePanel('language')}
          />
        </div>
      </section>

      {/* PRIVACY Section */}
      <section className="mb-8">
        <SectionHeader>PRIVACY</SectionHeader>
        <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
          <SettingsRow
            icon="visibility"
            label={t('settings.profile_visibility', 'Profile Visibility')}
            subtitle={profileVisible ? 'Visible to clients' : 'Hidden from clients'}
            trailing={
              <ToggleSwitch
                checked={profileVisible}
                onChange={handleToggleVisibility}
              />
            }
          />
          <SettingsRow
            icon="file_download"
            label={t('settings.data_export', 'POPIA Data Export')}
            subtitle="Download your data"
            onClick={handleDownloadData}
          />
          <SettingsRow
            icon="policy"
            label={t('settings.consent', 'POPIA Consent')}
            subtitle="Manage consent"
            onClick={() => setActivePanel('consent')}
          />
        </div>
      </section>

      {/* SUPPORT Section */}
      <section className="mb-8">
        <SectionHeader>SUPPORT</SectionHeader>
        <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
          <SettingsRow
            icon="help"
            label={t('settings.help', 'Help Centre')}
            onClick={() => router.push('/help')}
          />
          <SettingsRow
            icon="description"
            label={t('settings.legal', 'Legal Notice')}
            onClick={() => router.push('/terms')}
          />
          <SettingsRow
            icon="info"
            label={t('settings.about', 'About DomestIQ')}
            subtitle="v1.0.0"
            onClick={() => router.push('/about')}
          />
        </div>
      </section>

      {/* ACCOUNT ACTIONS Section */}
      <section className="mb-8">
        <SectionHeader>ACCOUNT ACTIONS</SectionHeader>
        <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
          <SettingsRow
            icon="logout"
            label="Log Out"
            onClick={handleLogout}
          />
        </div>
      </section>

      {/* DANGER ZONE Section */}
      <section className="mb-12">
        <SectionHeader danger>DANGER ZONE</SectionHeader>
        <div className="bg-[#f4f4f2] rounded-xl overflow-hidden">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <div>
                <SettingsRow
                  icon="delete_forever"
                  label="Delete Account"
                  danger
                  onClick={() => setDeleteDialogOpen(true)}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#bdc9c1]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#ba1a1a] font-heading">
                  <span className="material-symbols-outlined">warning</span>
                  Delete Account
                </DialogTitle>
                <DialogDescription className="text-[#3e4943]">
                  This will permanently remove your personal data, deactivate your worker profile,
                  and sign you out. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <Label htmlFor="delete-confirm" className="text-sm font-medium text-[#1a1c1b]">
                  Type <span className="font-mono font-bold text-[#ba1a1a]">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="border-[#ba1a1a]/30 focus-visible:ring-[#ba1a1a]"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false)
                    setDeleteConfirmText('')
                  }}
                  className="border-[#bdc9c1] text-[#1a1c1b]"
                >
                  Cancel
                </Button>
                <button
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ba1a1a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ba1a1a]/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <><WaveBars size="sm" /> Deleting...</>
                  ) : (
                    'Permanently Delete'
                  )}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Toast */}
      <InlineToast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
