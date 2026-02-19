'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, Loader2, FileText, ShieldCheck, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  type: 'id' | 'criminal_clearance'
  label: string
  description: string
  currentUrl?: string | null
  onUpload: (file: File) => Promise<string | null>
  className?: string
}

export function DocumentUpload({ type, label, description, currentUrl, onUpload, className }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploaded, setUploaded] = useState(!!currentUrl)
  const fileRef = useRef<HTMLInputElement>(null)

  const Icon = type === 'id' ? FileText : ShieldCheck

  const handleFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setUploading(true)
    const url = await onUpload(file)
    setUploading(false)
    if (url) { setUploaded(true); setPreview(url) }
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
        {preview ? (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden">
              <img src={preview} alt={label} className="w-full rounded-xl max-h-48 object-cover" />
              {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}
              {uploaded && <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>}
              <button onClick={() => { setPreview(null); setUploaded(false) }} className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-center text-muted-foreground">{uploaded ? 'Document uploaded - pending verification' : 'Uploading...'}</p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <Icon className="w-10 h-10 mx-auto text-muted-foreground" />
            <div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => fileRef.current?.click()}><Camera className="w-4 h-4 mr-1" /> Photo</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); fileRef.current.setAttribute('capture', 'environment') } }}><Upload className="w-4 h-4 mr-1" /> Upload</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
