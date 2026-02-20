'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VerificationBadge } from '@/components/worker/verification-badge'
import { SponsorBadge } from '@/components/shared/sponsor-badge'
import {
  ShieldCheck, FileText, Upload, CheckCircle2,
  XCircle, Clock, Loader2, AlertTriangle, Eye, ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning' | 'success'; icon: typeof Clock }> = {
  pending: { label: 'Pending Review', variant: 'warning', icon: Clock },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
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

      // Get documents
      const { data: docs } = await supabase
        .from('documents')
        .select('id, document_type, file_url, file_name, verification_status, rejection_reason, ocr_extracted_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (docs) setDocuments(docs as unknown as DocumentRecord[])

      // Get verification status from worker_profiles
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

  const getDocByType = (type: string) => documents.find(d => d.document_type === type)
  const idDoc = getDocByType('id_document')
  const criminalDoc = getDocByType('criminal_clearance')

  // Calculate progress
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

      // Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(path, file)

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

      // Create document record
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
        setDocuments(prev => [doc as unknown as DocumentRecord, ...prev.filter(d => d.document_type !== docType)])
      }

      // Trigger OCR
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
        // OCR is non-blocking
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(null)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  const renderDocCard = (type: string, label: string, description: string) => {
    const doc = getDocByType(type)
    const status = doc ? statusConfig[doc.verification_status] || statusConfig.pending : null
    const StatusIcon = status?.icon || Clock

    return (
      <Card className={cn(
        doc?.verification_status === 'approved' && 'border-emerald-200',
        doc?.verification_status === 'rejected' && 'border-red-200',
      )}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                doc?.verification_status === 'approved' ? 'bg-emerald-50' :
                doc?.verification_status === 'rejected' ? 'bg-red-50' :
                doc ? 'bg-amber-50' : 'bg-gray-100'
              )}>
                <FileText className={cn(
                  'w-5 h-5',
                  doc?.verification_status === 'approved' ? 'text-emerald-600' :
                  doc?.verification_status === 'rejected' ? 'text-red-500' :
                  doc ? 'text-amber-600' : 'text-gray-400'
                )} />
              </div>
              <div>
                <h3 className="font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {status && (
              <Badge variant={status.variant} className="gap-1 shrink-0">
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            )}
          </div>

          {/* Rejection reason */}
          {doc?.verification_status === 'rejected' && doc.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-sm text-red-700">{doc.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* OCR extracted data preview */}
          {doc?.ocr_extracted_data && Object.keys(doc.ocr_extracted_data).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3" /> Extracted Information
              </p>
              {Object.entries(doc.ocr_extracted_data).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Upload / Re-upload button */}
          <label className="cursor-pointer block">
            <div className={cn(
              "flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 transition-colors",
              uploading === type
                ? "border-emerald-300 bg-emerald-50"
                : "border-border hover:border-emerald-400 hover:bg-emerald-50/50"
            )}>
              {uploading === type ? (
                <>
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-sm font-medium text-emerald-700">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
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
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link href="/worker-profile/edit">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Verification</h1>
          <VerificationBadge idVerified={idVerified} criminalCheckClear={criminalCheckClear} size="sm" />
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm font-bold text-emerald-600">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={cn(
                  'h-3 rounded-full transition-all duration-700',
                  progress === 100
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>Upload</span>
              <span>ID Approved</span>
              <span>Fully Verified</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Why Verify */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <h3 className="font-semibold text-emerald-900 mb-1">Why get verified?</h3>
          <p className="text-sm text-emerald-800">
            Verified workers get up to 3x more bookings. Clients trust the gold shield badge and are more likely to book you.
          </p>
        </div>
        <div className="mt-3">
          <SponsorBadge placement="verification" />
        </div>
      </motion.div>

      {/* Document Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {renderDocCard('id_document', 'SA ID Document', 'Photo of your ID book or smart ID card')}
        {renderDocCard('criminal_clearance', 'Criminal Clearance', 'Police clearance certificate (SAPS)')}
      </motion.div>
    </div>
  )
}
