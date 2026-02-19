'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, Loader2, FileText, Check } from 'lucide-react'

interface OcrScannerProps {
  onScanComplete: (data: { raw_text: string; structured: Record<string, string> }) => void
  documentType?: 'id' | 'police_clearance' | 'general'
  className?: string
}

export function OcrScanner({ onScanComplete, documentType = 'id', className }: OcrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<{ raw_text: string; structured: Record<string, string> } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setScanning(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      const res = await fetch('/api/ai/ocr', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.raw_text) { setResult(data); onScanComplete(data) }
    } catch { /* silent */ }
    setScanning(false)
  }

  const labels: Record<string, string> = { id: 'SA ID Document', police_clearance: 'Police Clearance Certificate', general: 'Document' }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /><h3 className="font-semibold text-sm">Scan {labels[documentType]}</h3></div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} className="hidden" />
        {preview ? (
          <div className="relative rounded-xl overflow-hidden">
            <img src={preview} alt="Document preview" className="w-full rounded-xl" />
            {scanning && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl"><div className="text-center text-white"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /><p className="text-sm font-medium">Scanning...</p></div></div>}
            {result && <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors text-center">
              <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm font-medium">Take Photo</p>
            </button>
            <button type="button" onClick={() => { if (fileInputRef.current) { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); fileInputRef.current.setAttribute('capture', 'environment') } }} className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm font-medium">Upload File</p>
            </button>
          </div>
        )}
        {result && <div className="space-y-2">{Object.entries(result.structured).map(([key, value]) => (<div key={key} className="flex justify-between text-sm p-2 bg-muted rounded-lg"><span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span><span className="font-medium">{value}</span></div>))}</div>}
      </CardContent>
    </Card>
  )
}
