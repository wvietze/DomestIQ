'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react'

interface Document {
  id: string
  user_id: string
  document_type: string
  file_url: string
  file_name: string | null
  ocr_raw_text: string | null
  ocr_extracted_data: Record<string, string> | null
  verification_status: string
  rejection_reason: string | null
  created_at: string
  profiles: { full_name: string; email: string | null }
}

export default function VerificationsPage() {
  const supabase = createClient()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadDocuments() {
    const { data } = await supabase
      .from('documents')
      .select('*, profiles!user_id(full_name, email)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true })

    setDocuments((data || []) as unknown as Document[])
    setIsLoading(false)
  }

  async function handleVerify(docId: string, status: 'approved' | 'rejected') {
    setProcessing(docId)
    const { data: { user } } = await supabase.auth.getUser()

    const updateData: Record<string, unknown> = {
      verification_status: status,
      verified_by: user?.id,
      verified_at: new Date().toISOString(),
    }

    if (status === 'rejected') {
      updateData.rejection_reason = rejectionReasons[docId] || 'Document did not meet requirements'
    }

    await supabase.from('documents').update(updateData).eq('id', docId)

    // Update worker verification status if approved
    if (status === 'approved') {
      const doc = documents.find(d => d.id === docId)
      if (doc) {
        const updateField = doc.document_type === 'id_document'
          ? { id_verified: true }
          : { criminal_check_clear: true }
        await supabase.from('worker_profiles').update(updateField).eq('user_id', doc.user_id)

        // Notify user
        await supabase.from('notifications').insert({
          user_id: doc.user_id,
          type: 'verification_approved',
          title: 'Document Verified',
          body: `Your ${doc.document_type.replace('_', ' ')} has been verified.`,
        })
      }
    }

    setProcessing(null)
    loadDocuments()
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Verification Queue</h1>
        <Badge variant="outline">{documents.length} pending</Badge>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">No documents pending verification.</p>
          </CardContent>
        </Card>
      ) : (
        documents.map(doc => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {doc.document_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <Badge variant="warning">Pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Submitted by:</span>
                <span className="font-medium">{doc.profiles.full_name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>

              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View Document <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {doc.ocr_extracted_data && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs font-medium mb-1">OCR Extracted Data:</p>
                  {Object.entries(doc.ocr_extracted_data).map(([key, value]) => (
                    <p key={key} className="text-xs">
                      <span className="text-muted-foreground">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              )}

              <Textarea
                placeholder="Rejection reason (if rejecting)"
                value={rejectionReasons[doc.id] || ''}
                onChange={e => setRejectionReasons(prev => ({ ...prev, [doc.id]: e.target.value }))}
                rows={2}
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => handleVerify(doc.id, 'approved')}
                  disabled={processing === doc.id}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerify(doc.id, 'rejected')}
                  disabled={processing === doc.id}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
