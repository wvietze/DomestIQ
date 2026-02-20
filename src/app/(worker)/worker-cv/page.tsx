'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkHistoryForm } from '@/components/cv/work-history-form'
import { EducationForm } from '@/components/cv/education-form'
import { CvPreview } from '@/components/cv/cv-preview'
import { Loader2, Save, FileText, Eye } from 'lucide-react'
import type { WorkerCvData, CvRenderData, WorkHistoryEntry, EducationEntry } from '@/lib/types/cv'

// Dynamic import for PDF download wrapper (client-only, heavy)
const CvPdfDownload = dynamic(
  () => import('@/components/cv/cv-pdf-download').then(mod => mod.CvPdfDownload),
  { ssr: false, loading: () => <span className="text-sm text-muted-foreground">Loading PDF...</span> }
)

export default function WorkerCvPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // CV form data
  const [workHistory, setWorkHistory] = useState<WorkHistoryEntry[]>([])
  const [education, setEducation] = useState<EducationEntry[]>([])
  const [skills, setSkills] = useState('')
  const [languages, setLanguages] = useState('')
  const [personalStatement, setPersonalStatement] = useState('')

  // Profile data (read-only, for preview)
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: '',
    suburb: '',
    city: '',
    services: [] as string[],
    years_experience: 0,
    rating: 0,
    review_count: 0,
    top_traits: {} as Record<string, number>,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/cv-data')
      const data = await res.json()
      if (data.cvData) {
        const cv = data.cvData as WorkerCvData
        setWorkHistory(cv.work_history || [])
        setEducation(cv.education || [])
        setSkills((cv.skills || []).join(', '))
        setLanguages((cv.languages || []).join(', '))
        setPersonalStatement(cv.personal_statement || '')
      }
    } catch { /* fresh form */ }
    setLoading(false)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/cv-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_history: workHistory,
          education,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          languages: languages.split(',').map(l => l.trim()).filter(Boolean),
          personal_statement: personalStatement || null,
        }),
      })
      if (res.ok) setSaved(true)
    } catch { /* silent */ }
    setSaving(false)
  }, [workHistory, education, skills, languages, personalStatement])

  const renderData: CvRenderData = {
    full_name: profileData.full_name || 'Your Name',
    phone: profileData.phone || '0XX XXX XXXX',
    email: profileData.email || 'your@email.com',
    suburb: profileData.suburb,
    city: profileData.city,
    services: profileData.services,
    years_experience: profileData.years_experience,
    work_history: workHistory,
    education,
    skills: skills.split(',').map(s => s.trim()).filter(Boolean),
    languages: languages.split(',').map(l => l.trim()).filter(Boolean),
    personal_statement: personalStatement || null,
    top_traits: profileData.top_traits,
    rating: profileData.rating,
    review_count: profileData.review_count,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" /> CV Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build a professional CV — it&apos;s free and yours to keep
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </Button>
          <CvPdfDownload
            data={renderData}
            fileName={`${(profileData.full_name || 'cv').replace(/\s+/g, '_')}_CV.pdf`}
          />
        </div>
      </div>

      <Tabs defaultValue="edit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="edit" className="gap-1.5"><FileText className="w-4 h-4" /> Edit</TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5"><Eye className="w-4 h-4" /> Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          {/* Personal Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={personalStatement}
                onChange={e => setPersonalStatement(e.target.value)}
                placeholder="A brief summary about yourself, your experience, and what makes you a great worker..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Work History */}
          <Card>
            <CardContent className="pt-6">
              <WorkHistoryForm entries={workHistory} onChange={setWorkHistory} />
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardContent className="pt-6">
              <EducationForm entries={education} onChange={setEducation} />
            </CardContent>
          </Card>

          {/* Skills & Languages */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-base font-semibold">Skills</Label>
                <Input
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. Cleaning, Ironing, Cooking, Garden maintenance"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
              </div>
              <div>
                <Label className="text-base font-semibold">Languages</Label>
                <Input
                  value={languages}
                  onChange={e => setLanguages(e.target.value)}
                  placeholder="e.g. English, isiZulu, Afrikaans"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <CvPreview data={renderData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
