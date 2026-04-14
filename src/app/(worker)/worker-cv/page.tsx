'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { WorkHistoryForm } from '@/components/cv/work-history-form'
import { EducationForm } from '@/components/cv/education-form'
import { CvPreview } from '@/components/cv/cv-preview'
import { createClient } from '@/lib/supabase/client'
import type { WorkerCvData, CvRenderData, WorkHistoryEntry, EducationEntry } from '@/lib/types/cv'

// Dynamic import for PDF download wrapper (client-only, heavy)
const CvPdfDownload = dynamic(
  () => import('@/components/cv/cv-pdf-download').then((mod) => mod.CvPdfDownload),
  {
    ssr: false,
    loading: () => (
      <span className="text-sm text-[#3e4943]">Loading PDF...</span>
    ),
  }
)

type Mode = 'edit' | 'preview'

export default function WorkerCvPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState<Mode>('edit')

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
  const [serviceAreas, setServiceAreas] = useState<string[]>([])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
      /* fresh form */
    }

    // Load profile data from Supabase for the CV
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('id', user.id)
          .single()

        const { data: wp } = await supabase
          .from('worker_profiles')
          .select('id, overall_rating, total_reviews, years_experience, bio')
          .eq('user_id', user.id)
          .single()

        const { data: cp } = await supabase
          .from('client_profiles')
          .select('suburb, city')
          .eq('user_id', user.id)
          .single()

        let serviceNames: string[] = []
        if (wp) {
          const { data: wsSvc } = await supabase
            .from('worker_services')
            .select('service:services(name)')
            .eq('worker_id', wp.id)
          if (wsSvc) {
            serviceNames = wsSvc
              .map((ws: { service: unknown }) => {
                const svc = ws.service as { name: string } | { name: string }[] | null
                return Array.isArray(svc) ? svc[0]?.name : svc?.name
              })
              .filter(Boolean) as string[]
          }

          const { data: areas } = await supabase
            .from('worker_service_areas')
            .select('city')
            .eq('worker_profile_id', wp.id)
          if (areas) {
            setServiceAreas([
              ...new Set(
                areas.map((a: { city: string }) => a.city).filter(Boolean)
              ),
            ])
          }

          const { data: traits } = await supabase
            .from('review_traits')
            .select('trait, count')
            .eq('worker_id', user.id)
            .order('count', { ascending: false })
            .limit(5)
          const topTraits: Record<string, number> = {}
          if (traits) {
            for (const t of traits) {
              topTraits[t.trait] = t.count
            }
          }

          setProfileData({
            full_name: prof?.full_name || '',
            phone: prof?.phone || '',
            email: prof?.email || '',
            suburb: cp?.suburb || '',
            city: cp?.city || serviceAreas[0] || '',
            services: serviceNames,
            years_experience: wp.years_experience || 0,
            rating: wp.overall_rating || 0,
            review_count: wp.total_reviews || 0,
            top_traits: topTraits,
          })

          if (!personalStatement && wp.bio) {
            setPersonalStatement(wp.bio)
          }
        }
      }
    } catch (err) {
      console.error('Profile data load error:', err)
    }

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
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
          languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
          personal_statement: personalStatement || null,
        }),
      })
      if (res.ok) setSaved(true)
    } catch {
      /* silent */
    }
    setSaving(false)
  }, [workHistory, education, skills, languages, personalStatement])

  const renderData: CvRenderData = {
    full_name: profileData.full_name || 'Your Name',
    phone: profileData.phone || '0XX XXX XXXX',
    email: profileData.email || 'your@email.com',
    suburb: profileData.suburb,
    city: profileData.city,
    services: profileData.services,
    service_areas: serviceAreas,
    years_experience: profileData.years_experience,
    work_history: workHistory,
    education,
    skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
    languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
    personal_statement: personalStatement || null,
    top_traits: profileData.top_traits,
    rating: profileData.rating,
    review_count: profileData.review_count,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-4xl text-[#6e7a73] animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] pb-40">
      {/* Top App Bar */}
      <header className="bg-[#f9f9f7] sticky top-0 z-40 flex items-center px-4 h-16 border-b border-[#e8e8e6]/40">
        <Link
          href="/worker-profile/edit"
          className="p-2 -ml-2 rounded-full hover:bg-[#e8e8e6] active:scale-95 transition-all text-[#005d42]"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="ml-2 font-heading font-bold tracking-tight text-lg text-[#1a1c1b]">
          CV Builder
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-6">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#f4f4f2] p-1 rounded-lg flex">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`px-6 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                mode === 'edit'
                  ? 'bg-white text-[#005d42] shadow-sm'
                  : 'text-[#3e4943]'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-6 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                mode === 'preview'
                  ? 'bg-white text-[#005d42] shadow-sm'
                  : 'text-[#3e4943]'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {mode === 'edit' ? (
          <div className="space-y-6">
            {/* Personal Statement */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-[11px] font-bold text-[#005d42] uppercase tracking-widest mb-4">
                Personal Statement
              </h3>
              <textarea
                value={personalStatement}
                onChange={(e) => setPersonalStatement(e.target.value)}
                placeholder="A brief summary about yourself, your experience, and what makes you a great worker..."
                rows={4}
                className="w-full bg-[#f4f4f2] border-none rounded-lg p-4 text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42]/30 resize-none"
              />
            </section>

            {/* Work History */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-[11px] font-bold text-[#005d42] uppercase tracking-widest mb-4">
                Work History
              </h3>
              <WorkHistoryForm entries={workHistory} onChange={setWorkHistory} />
            </section>

            {/* Education */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-[11px] font-bold text-[#005d42] uppercase tracking-widest mb-4">
                Education
              </h3>
              <EducationForm entries={education} onChange={setEducation} />
            </section>

            {/* Skills & Languages */}
            <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
              <div>
                <h3 className="text-[11px] font-bold text-[#005d42] uppercase tracking-widest mb-3">
                  Skills
                </h3>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Cleaning, Ironing, Cooking, Garden maintenance"
                  className="w-full bg-[#f4f4f2] border-none rounded-lg p-4 text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42]/30"
                />
                <p className="text-xs text-[#6e7a73] mt-2">Separate with commas</p>
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-[#005d42] uppercase tracking-widest mb-3">
                  Languages
                </h3>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, isiZulu, Afrikaans"
                  className="w-full bg-[#f4f4f2] border-none rounded-lg p-4 text-[#1a1c1b] placeholder:text-[#6e7a73] focus:outline-none focus:ring-2 focus:ring-[#005d42]/30"
                />
                <p className="text-xs text-[#6e7a73] mt-2">Separate with commas</p>
              </div>
            </section>

            {/* Service Areas */}
            {serviceAreas.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-[11px] font-bold text-[#005d42] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#005d42]">
                    location_on
                  </span>
                  Service Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {serviceAreas.map((city) => (
                    <span
                      key={city}
                      className="text-xs font-bold uppercase tracking-wider bg-[#97f5cc] text-[#005d42] px-3 py-1.5 rounded"
                    >
                      {city}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#6e7a73] mt-3">
                  These are pulled from your profile. Edit them in your worker
                  profile settings.
                </p>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <CvPreview data={renderData} />
          </div>
        )}
      </main>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#e8e8e6]/60">
        <div className="max-w-4xl mx-auto p-4 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#e8e8e6] text-[#1a1c1b] font-bold rounded-lg py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined">
                {saved ? 'check_circle' : 'save'}
              </span>
            )}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
          </button>
          <div className="flex-1">
            <CvPdfDownload
              data={renderData}
              fileName={`${(profileData.full_name || 'cv').replace(/\s+/g, '_')}_CV.pdf`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
