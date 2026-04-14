'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { SponsorBadge } from '@/components/shared/sponsor-badge'

interface DocumentRecord {
  id: string
  document_type: string
  file_url: string
  file_name: string
  verification_status: string
  rejection_reason: string | null
  ocr_extracted_data: Record<string, string> | null
  created_at: string
}

type StatusKey = 'pending' | 'approved' | 'rejected'

const STATUS_META: Record<
  StatusKey,
  { label: string; icon: string; badgeBg: string; badgeText: string }
> = {
  pending: {
    label: 'Pending Review',
    icon: 'schedule',
    badgeBg: 'bg-[#ffdcc3]',
    badgeText: 'text-[#904d00]',
  },
  approved: {
    label: 'Approved',
    icon: 'check_circle',
    badgeBg: 'bg-[#97f5cc]',
    badgeText: 'text-[#005d42]',
  },
  rejected: {
    label: 'Rejected',
    icon: 'cancel',
    badgeBg: 'bg-[#ffdad6]',
    badgeText: 'text-[#ba1a1a]',
  },
}

export default function WorkerVerificationPage() {
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [idVerified, setIdVerified] = useState(false)
  const [criminalCheckClear, setCriminalCheckClear] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!user) return

      const { data: docs } = await supabase
        .from('documents')
        .select(
          'id, document_type, file_url, file_name, verification_status, rejection_reason, ocr_extracted_data, created_at'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (docs) setDocuments(docs as unknown as DocumentRecord[])

      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('id_verified, criminal_check_clear')
        .eq('user_id', user.id)
        .single()

      if (wp) {
        setIdVerified(!!wp.id_verified)
        setCriminalCheckClear(!!wp.criminal_check_clear)
      }

      setIsLoading(false)
    }
    if (!userLoading) loadData()
  }, [user, userLoading, supabase])

  const getDocByType = (type: string) =>
    documents.find((d) => d.document_type === type)
  const idDoc = getDocByType('id_document')

  const calculateProgress = (): number => {
    if (idVerified && criminalCheckClear) return 100
    if (idDoc?.verification_status === 'approved') return 75
    if (idDoc) return 50
    return 0
  }

  const progress = calculateProgress()

  const handleUpload = async (docType: string, file: File) => {
    if (!user) return
    setUploading(docType)

    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${docType}-${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(path, file)

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(path)

      const { data: doc, error: insertErr } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          document_type: docType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          verification_status: 'pending',
        })
        .select()
        .single()

      if (insertErr) throw insertErr

      if (doc) {
        setDocuments((prev) => [
          doc as unknown as DocumentRecord,
          ...prev.filter((d) => d.document_type !== docType),
        ])
      }

      try {
        await fetch('/api/ai/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: doc?.id,
            image_url: urlData.publicUrl,
          }),
        })
      } catch {
        /* OCR is non-blocking */
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(null)
    }
  }

  const renderDocSection = (
    type: string,
    label: string,
    description: string,
    iconName: string,
    iconColor: 'primary' | 'secondary'
  ) => {
    const doc = getDocByType(type)
    const statusKey: StatusKey = (doc?.verification_status as StatusKey) || 'pending'
    const status = doc ? STATUS_META[statusKey] : null

    const iconBg = iconColor === 'primary' ? 'bg-[#9ffdd3]' : 'bg-[#ffdcc3]'
    const iconFg = iconColor === 'primary' ? 'text-[#005d42]' : 'text-[#904d00]'

    return (
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`${iconBg} p-2.5 rounded-lg shrink-0`}>
                <span className={`material-symbols-outlined ${iconFg}`}>
                  {iconName}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-base text-[#1a1c1b] truncate">
                  {label}
                </h3>
                <p className="text-xs text-[#3e4943] truncate">{description}</p>
              </div>
            </div>
            {status && (
              <div
                className={`${status.badgeBg} ${status.badgeText} flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {status.icon}
                </span>
                {status.label}
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {doc?.verification_status === 'rejected' && doc.rejection_reason && (
            <div className="bg-[#ffdad6] rounded-lg p-3 flex items-start gap-2 mb-4">
              <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0 mt-0.5">
                error
              </span>
              <div>
                <p className="text-sm font-semibold text-[#ba1a1a]">Rejected</p>
                <p className="text-sm text-[#ba1a1a]">{doc.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* OCR extracted data preview */}
          {doc?.ocr_extracted_data &&
            Object.keys(doc.ocr_extracted_data).length > 0 && (
              <div className="bg-[#f4f4f2] rounded-lg p-4 space-y-1 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#3e4943] flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-sm">
                    visibility
                  </span>
                  Extracted Information
                </p>
                {Object.entries(doc.ocr_extracted_data).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[#3e4943] capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-[#1a1c1b]">{value}</span>
                  </div>
                ))}
              </div>
            )}

          {/* Submission info */}
          {doc && doc.verification_status !== 'approved' && (
            <div className="flex gap-4 items-center p-4 bg-[#f4f4f2] rounded-lg mb-4">
              <div className="w-14 h-16 bg-white rounded border border-[#e8e8e6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#bdc9c1] text-2xl">
                  description
                </span>
              </div>
              <div>
                <p className="font-semibold text-[#1a1c1b] text-sm mb-0.5">
                  Submitted{' '}
                  {new Date(doc.created_at).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-[#3e4943]">
                  Under review by our trust &amp; safety team.
                </p>
              </div>
            </div>
          )}

          {doc && doc.verification_status === 'approved' && (
            <div className="bg-[#f4f4f2] p-3 rounded-lg flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#005d42]">
                security
              </span>
              <span className="text-xs text-[#3e4943] leading-tight">
                Identity data is encrypted using 256-bit AES protocol.
              </span>
            </div>
          )}

          {/* Upload button */}
          <label className="cursor-pointer block">
            <div
              className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
                uploading === type
                  ? 'border-[#005d42] bg-[#9ffdd3]/30'
                  : 'border-[#bdc9c1] hover:border-[#005d42] hover:bg-[#f4f4f2]'
              }`}
            >
              {uploading === type ? (
                <>
                  <span className="material-symbols-outlined text-[#005d42] animate-spin">
                    progress_activity
                  </span>
                  <span className="text-sm font-semibold text-[#005d42]">
                    Uploading...
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#3e4943]">
                    upload
                  </span>
                  <span className="text-sm font-semibold text-[#3e4943]">
                    {doc ? 'Re-upload Document' : 'Upload Document'}
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(type, file)
                e.target.value = ''
              }}
              disabled={uploading !== null}
            />
          </label>
        </div>
      </section>
    )
  }

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#6e7a73] animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] pb-16">
      {/* Top App Bar */}
      <header className="bg-[#f9f9f7] sticky top-0 z-40 flex items-center px-4 h-16 border-b border-[#e8e8e6]/40">
        <Link
          href="/worker-profile/edit"
          className="p-2 -ml-2 rounded-full hover:bg-[#e8e8e6] active:scale-95 transition-all text-[#005d42]"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="ml-2 font-heading font-bold tracking-tight text-lg text-[#1a1c1b]">
          Identity Verification
        </h1>
      </header>

      <main className="max-w-xl mx-auto px-5 pt-8 pb-12">
        {/* Hero */}
        <div className="mb-8">
          <span className="text-[#3e4943] text-[11px] font-bold tracking-widest uppercase mb-2 block">
            Worker: Verification
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1a1c1b] leading-tight mb-3 tracking-tight">
            Get verified.
            <br />
            Get more bookings.
          </h2>
          <p className="text-[#3e4943] text-base leading-relaxed max-w-md">
            Verified workers are prioritized in search results and earn a trust
            badge for their profile.
          </p>
        </div>

        {/* Progress Card */}
        <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3e4943]">
              Verification Progress
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#005d42]">
              {progress}% complete
            </span>
          </div>
          <div className="h-2 w-full bg-[#e8e8e6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#005d42] rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[#6e7a73]">
            <span>Upload</span>
            <span>ID Approved</span>
            <span>Fully Verified</span>
          </div>
        </section>

        {/* Sponsor */}
        <div className="mb-6">
          <SponsorBadge placement="verification" />
        </div>

        {/* Document Sections */}
        <div className="space-y-4">
          {renderDocSection(
            'id_document',
            'SA ID Document',
            'Photo of your ID book or smart ID card',
            'verified_user',
            'primary'
          )}
          {renderDocSection(
            'criminal_clearance',
            'Criminal Clearance',
            'Police clearance certificate (SAPS)',
            'gavel',
            'secondary'
          )}
        </div>

        {/* Footer Card */}
        <footer className="bg-[#f4f4f2] rounded-xl p-6 mt-6">
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-[#005d42] text-3xl shrink-0">
              verified
            </span>
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-[#1a1c1b]">
                Safe &amp; Secure
              </h4>
              <p className="text-sm text-[#3e4943] leading-relaxed">
                Our team reviews documents within 48 hours. Your information is
                encrypted and stored securely per POPIA (Protection of Personal
                Information Act) requirements.
              </p>
              <div className="pt-1 flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-[#3e4943]">
                  <span className="material-symbols-outlined text-base">
                    lock_person
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    POPIA Compliant
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#3e4943]">
                  <span className="material-symbols-outlined text-base">
                    encrypted
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    256-bit AES
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
