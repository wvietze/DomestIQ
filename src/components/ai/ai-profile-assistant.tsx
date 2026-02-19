'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
          <div><h3 className="font-semibold text-sm">AI Profile Writer</h3><p className="text-xs text-muted-foreground">Generate a professional bio</p></div>
        </div>
        <Textarea placeholder="Tell us about yourself, your experience, what makes you great... (optional)" value={extraInfo} onChange={e => setExtraInfo(e.target.value)} rows={2} className="text-sm" />
        <Button onClick={handleGenerate} disabled={loading} className="w-full" variant="outline">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {loading ? 'Writing...' : 'Generate Bio'}
        </Button>
        {generatedBio && (
          <div className="p-3 bg-muted rounded-lg space-y-3">
            <p className="text-sm leading-relaxed">{generatedBio}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedBio); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}{copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" onClick={() => onBioGenerated(generatedBio)}>Use This Bio</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
