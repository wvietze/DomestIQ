'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { WaveBars } from '@/components/loading'

interface AiProfileAssistantProps {
  workerName: string
  services: string[]
  yearsExperience?: number
  onBioGenerated: (bio: string) => void
  className?: string
}

export function AiProfileAssistant({ workerName, services, yearsExperience, onBioGenerated, className }: AiProfileAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [generatedBio, setGeneratedBio] = useState('')
  const [copied, setCopied] = useState(false)
  const [extraInfo, setExtraInfo] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/profile-generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: workerName, services, yearsExperience, additionalInfo: extraInfo }) })
      const data = await res.json()
      if (data.bio) setGeneratedBio(data.bio)
    } catch { /* silent */ }
    setLoading(false)
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#005d42] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">auto_awesome</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#1a1c1b]">AI Profile Writer</h3>
            <p className="text-xs text-[#3e4943]">Generate a professional bio</p>
          </div>
        </div>
        <Textarea placeholder="Tell us about yourself, your experience, what makes you great... (optional)" value={extraInfo} onChange={e => setExtraInfo(e.target.value)} rows={2} className="text-sm bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
        <Button onClick={handleGenerate} disabled={loading} className="w-full border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]" variant="outline">
          {loading ? <WaveBars size="sm" /> : <span className="material-symbols-outlined text-base mr-2">auto_awesome</span>}
          {loading ? 'Writing...' : 'Generate Bio'}
        </Button>
        {generatedBio && (
          <div className="p-3 bg-[#f4f4f2] rounded-lg space-y-3">
            <p className="text-sm leading-relaxed text-[#1a1c1b]">{generatedBio}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-[#bdc9c1] text-[#1a1c1b] hover:bg-white" onClick={() => { navigator.clipboard.writeText(generatedBio); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                <span className="material-symbols-outlined text-sm mr-1">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" className="bg-[#005d42] hover:bg-[#047857] text-white" onClick={() => onBioGenerated(generatedBio)}>Use This Bio</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
