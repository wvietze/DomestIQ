'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  const iconName = type === 'id' ? 'description' : 'verified_user'

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
    <Card className={cn('bg-white', className)}>
      <CardContent className="p-4">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
        {preview ? (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={label} className="w-full rounded-xl max-h-48 object-cover" />
              {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="material-symbols-outlined text-3xl text-white animate-spin">progress_activity</span></div>}
              {uploaded && <div className="absolute top-2 right-2 bg-[#005d42] text-white p-1 rounded-full"><span className="material-symbols-outlined text-sm">check</span></div>}
              <button onClick={() => { setPreview(null); setUploaded(false) }} className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <p className="text-sm text-center text-[#3e4943]">{uploaded ? 'Document uploaded - pending verification' : 'Uploading...'}</p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#6e7a73]">{iconName}</span>
            <div><p className="font-semibold text-sm text-[#1a1c1b]">{label}</p><p className="text-xs text-[#3e4943]">{description}</p></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]" onClick={() => fileRef.current?.click()}><span className="material-symbols-outlined text-base mr-1">photo_camera</span> Photo</Button>
              <Button variant="outline" size="sm" className="flex-1 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]" onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); fileRef.current.setAttribute('capture', 'environment') } }}><span className="material-symbols-outlined text-base mr-1">upload</span> Upload</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
