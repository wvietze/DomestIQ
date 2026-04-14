'use client'

import { useState, useRef } from 'react'
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Upload" className="w-full h-full object-cover" />
          {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="material-symbols-outlined text-white text-2xl animate-spin">progress_activity</span></div>}
          {onRemove && !uploading && (
            <button onClick={() => { setPreview(null); onRemove() }} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-full hover:bg-black/70"><span className="material-symbols-outlined text-sm">close</span></button>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          className={cn('w-full h-full border-2 border-dashed border-[#bdc9c1] hover:border-[#6e7a73] transition-colors flex flex-col items-center justify-center gap-1', shape === 'circle' ? 'rounded-full' : 'rounded-xl')}>
          <span className="material-symbols-outlined text-2xl text-[#3e4943]">photo_camera</span>
          <span className="text-[10px] text-[#3e4943]">Photo</span>
        </button>
      )}
    </div>
  )
}
