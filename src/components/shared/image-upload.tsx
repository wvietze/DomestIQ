'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  currentUrl?: string | null
  onUpload: (file: File) => Promise<string | null>
  onRemove?: () => void
  shape?: 'square' | 'circle'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-20 h-20', md: 'w-32 h-32', lg: 'w-40 h-40' }

export function ImageUpload({ currentUrl, onUpload, onRemove, shape = 'circle', size = 'md', className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setUploading(true)
    const url = await onUpload(file)
    setUploading(false)
    if (url) setPreview(url)
  }

  return (
    <div className={cn('relative inline-block', sizes[size], className)}>
      <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
      {preview ? (
        <div className={cn('relative w-full h-full overflow-hidden', shape === 'circle' ? 'rounded-full' : 'rounded-xl')}>
          <img src={preview} alt="Upload" className="w-full h-full object-cover" />
          {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
          {onRemove && !uploading && (
            <button onClick={() => { setPreview(null); onRemove() }} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-full hover:bg-black/70"><X className="w-3.5 h-3.5" /></button>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          className={cn('w-full h-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-1', shape === 'circle' ? 'rounded-full' : 'rounded-xl')}>
          <Camera className="w-6 h-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Photo</span>
        </button>
      )}
    </div>
  )
}
