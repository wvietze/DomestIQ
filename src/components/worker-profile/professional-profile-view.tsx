'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TRAIT_LABELS, TRAIT_EMOJIS } from '@/lib/types/review'
import type { WorkerProfileViewData } from '@/lib/types/worker-profile-view'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const SKILL_COLORS: Record<string, string> = {
  beginner: 'bg-[#9ffdd3]/40 text-[#005d42]',
  intermediate: 'bg-[#ffdcc3]/40 text-[#904d00]',
  advanced: 'bg-[#9ffdd3] text-[#005d42]',
  expert: 'bg-[#005d42] text-white',
}

function PromptCard({ iconName, title, description, href }: {
  iconName: string
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-[#ffdcc3] bg-[#ffdcc3]/20 hover:bg-[#ffdcc3]/40 transition-colors">
        <div className="w-10 h-10 rounded-full bg-[#ffdcc3] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl text-[#904d00]">{iconName}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1a1c1b]">{title}</p>
          <p className="text-xs text-[#3e4943]">{description}</p>
        </div>
        <span className="material-symbols-outlined text-base text-[#fe932c] shrink-0">add</span>
      </div>
    </Link>
  )
}

export function ProfessionalProfileView({ data }: { data: WorkerProfileViewData }) {
  const { profile, services, availability, portfolio, reviews, topTraits, references, estates, jobsCompleted, cvData } = data
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const initials = profile.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const headline = services.length > 0
    ? services.map(s => s.service_name).join(' · ')
    : 'Worker'

  const completeness = profile.profile_completeness || 0

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header Banner */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative bg-[#005d42] p-6 pb-8">
          <div className="relative flex items-start gap-4">
            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg shrink-0">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
              <AvatarFallback className="text-2xl bg-white/20 text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-white">
              <h1 className="text-xl font-bold truncate">{profile.full_name}</h1>
              <p className="text-sm text-[#9ffdd3] truncate">{headline}</p>
              {profile.location_lat && (
                <p className="text-xs text-[#97f5cc] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {profile.service_radius_km ? `${profile.service_radius_km}km radius` : 'Location set'}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-[#fe932c]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-sm font-semibold">{profile.overall_rating.toFixed(1)}</span>
                  <span className="text-xs text-[#97f5cc]">({profile.total_reviews})</span>
                </div>
                {profile.id_verified && (
                  <Badge className="bg-white/20 text-white border-0 gap-1 text-xs">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Verified
                  </Badge>
                )}
                {profile.criminal_check_clear && (
                  <Badge className="bg-white/20 text-white border-0 gap-1 text-xs">
                    <span className="material-symbols-outlined text-xs">verified_user</span>
                    Background Clear
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Quick stats row */}
        <div className="grid grid-cols-3 divide-x divide-[#e8e8e6] bg-white">
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-[#005d42]">{jobsCompleted}</p>
            <p className="text-[10px] uppercase text-[#3e4943] tracking-wide">Jobs Done</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-[#904d00]">
              {profile.hourly_rate ? `R${profile.hourly_rate}` : '—'}
            </p>
            <p className="text-[10px] uppercase text-[#3e4943] tracking-wide">Per Hour</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-[#005d42]">{completeness}%</p>
            <p className="text-[10px] uppercase text-[#3e4943] tracking-wide">Complete</p>
          </div>
        </div>
      </Card>

      {/* Completeness prompts */}
      {completeness < 100 && (
        <div className="space-y-2">
          {!profile.bio && (
            <PromptCard
              iconName="edit_note"
              title="Add your bio"
              description="Tell clients about yourself and your experience"
              href="/worker-profile/edit"
            />
          )}
          {portfolio.length === 0 && (
            <PromptCard
              iconName="photo_camera"
              title="Upload portfolio photos"
              description="Show off your best work to attract more clients"
              href="/worker-profile/edit"
            />
          )}
          {references.length === 0 && (
            <PromptCard
              iconName="person"
              title="Request a reference"
              description="References from past clients build trust"
              href="/worker-profile/edit"
            />
          )}
          {!cvData && (
            <PromptCard
              iconName="description"
              title="Build your CV"
              description="A complete CV helps you stand out"
              href="/worker-cv"
            />
          )}
        </div>
      )}

      {/* About */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-2 flex items-center gap-2 text-[#1a1c1b]">
            <span className="material-symbols-outlined text-base text-[#005d42]">person</span>
            About
          </h2>
          {profile.bio ? (
            <p className="text-sm text-[#3e4943] leading-relaxed">{profile.bio}</p>
          ) : cvData?.personal_statement ? (
            <p className="text-sm text-[#3e4943] leading-relaxed">{cvData.personal_statement}</p>
          ) : (
            <p className="text-sm text-[#3e4943] italic">No bio added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Services & Skills table */}
      {services.length > 0 && (
        <Card className="bg-white">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
              <span className="material-symbols-outlined text-base text-[#005d42]">work</span>
              Services & Skills
            </h2>
            <div className="space-y-3">
              {services.map(svc => (
                <div key={svc.id} className="flex items-center gap-3 py-2 border-b border-[#e8e8e6] last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-[#9ffdd3]/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl text-[#005d42]">work</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1c1b]">{svc.service_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {svc.skill_level && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SKILL_COLORS[svc.skill_level] || 'bg-[#eeeeec] text-[#3e4943]'}`}>
                          {svc.skill_level}
                        </span>
                      )}
                      {svc.years_experience != null && (
                        <span className="text-[10px] text-[#3e4943]">
                          {svc.years_experience} {svc.years_experience === 1 ? 'year' : 'years'}
                        </span>
                      )}
                    </div>
                  </div>
                  {svc.custom_rate && (
                    <span className="text-sm font-semibold text-[#005d42]">R{svc.custom_rate}/hr</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio gallery */}
      {portfolio.length > 0 && (
        <Card className="bg-white">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
              <span className="material-symbols-outlined text-base text-[#005d42]">photo_camera</span>
              Portfolio
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {portfolio.map((img, i) => (
                <div
                  key={img.id}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxIdx(i)}
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption || 'Portfolio'}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio lightbox */}
      {lightboxIdx !== null && portfolio[lightboxIdx] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxIdx(null)}>
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          {lightboxIdx > 0 && (
            <button className="absolute left-4 text-white" onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }}>
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>
          )}
          {lightboxIdx < portfolio.length - 1 && (
            <button className="absolute right-4 text-white" onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }}>
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>
          )}
          <Image
            src={portfolio[lightboxIdx].image_url}
            alt={portfolio[lightboxIdx].caption || 'Portfolio'}
            width={800}
            height={800}
            className="max-h-[80vh] max-w-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          {portfolio[lightboxIdx].caption && (
            <p className="absolute bottom-6 text-white text-center text-sm">{portfolio[lightboxIdx].caption}</p>
          )}
        </div>
      )}

      {/* Reviews & Traits */}
      {(topTraits.length > 0 || reviews.length > 0) && (
        <Card className="bg-white">
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold flex items-center gap-2 text-[#1a1c1b]">
              <span className="material-symbols-outlined text-base text-[#fe932c]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              Reviews & Traits
            </h2>
            {/* Top traits */}
            {topTraits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topTraits.map(trait => (
                  <Badge
                    key={trait}
                    variant="outline"
                    className="gap-1 bg-[#ffdcc3]/30 border-[#ffdcc3] text-[#904d00]"
                  >
                    {(TRAIT_EMOJIS as Record<string, string>)[trait] || '✨'}
                    {(TRAIT_LABELS as Record<string, string>)[trait] || trait}
                  </Badge>
                ))}
              </div>
            )}
            {/* Review cards */}
            {reviews.length > 0 && (
              <div className="space-y-3">
                {reviews.slice(0, 3).map(review => (
                  <div key={review.id} className="p-3 rounded-xl bg-[#f4f4f2] space-y-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span
                          key={s}
                          className="material-symbols-outlined text-xs"
                          style={{
                            color: s <= review.overall_rating ? '#fe932c' : '#e2e3e1',
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[#3e4943]">&ldquo;{review.comment}&rdquo;</p>
                    )}
                  </div>
                ))}
                {reviews.length > 3 && (
                  <p className="text-xs text-center text-[#3e4943]">
                    +{reviews.length - 3} more reviews
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* References */}
      {references.length > 0 && (
        <Card className="bg-white">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
              <span className="material-symbols-outlined text-base text-[#005d42]">person</span>
              References
            </h2>
            <div className="space-y-3">
              {references.map(ref => (
                <div key={ref.id} className="p-3 rounded-xl bg-[#f4f4f2] space-y-1">
                  <p className="text-sm font-medium text-[#1a1c1b]">{ref.client_name || 'Client'}</p>
                  <p className="text-xs text-[#3e4943] capitalize">{ref.relationship.replace('_', ' ')}</p>
                  {ref.duration_months && (
                    <p className="text-xs text-[#3e4943]">{ref.duration_months} months</p>
                  )}
                  <p className="text-sm text-[#3e4943] mt-1">&ldquo;{ref.reference_text}&rdquo;</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work History & Education (from CV data) */}
      {cvData && (cvData.work_history.length > 0 || cvData.education.length > 0) && (
        <Card className="bg-white">
          <CardContent className="p-4 space-y-4">
            {cvData.work_history.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
                  <span className="material-symbols-outlined text-base text-[#005d42]">apartment</span>
                  Work History
                </h2>
                <div className="space-y-3">
                  {cvData.work_history.map((job, i) => (
                    <div key={i} className="border-l-2 border-[#9ffdd3] pl-3 space-y-0.5">
                      <p className="text-sm font-medium text-[#1a1c1b]">{job.role}</p>
                      <p className="text-xs text-[#3e4943]">{job.employer}</p>
                      <p className="text-xs text-[#3e4943]">
                        {job.start_date} — {job.end_date || 'Present'}
                      </p>
                      {job.description && (
                        <p className="text-xs text-[#3e4943] mt-1">{job.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cvData.education.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
                  <span className="material-symbols-outlined text-base text-[#005d42]">school</span>
                  Education
                </h2>
                <div className="space-y-3">
                  {cvData.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-[#97f5cc] pl-3 space-y-0.5">
                      <p className="text-sm font-medium text-[#1a1c1b]">{edu.qualification}</p>
                      <p className="text-xs text-[#3e4943]">{edu.institution}</p>
                      <p className="text-xs text-[#3e4943]">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Availability */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
            <span className="material-symbols-outlined text-base text-[#005d42]">calendar_today</span>
            Availability
          </h2>
          {availability.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {availability.filter(a => a.is_available).map(slot => (
                <div key={slot.id} className="flex items-center justify-between py-2 px-3 bg-[#9ffdd3]/20 rounded-lg">
                  <span className="text-sm font-medium text-[#1a1c1b]">{DAYS[slot.day_of_week]}</span>
                  <span className="text-xs text-[#3e4943] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </span>
                </div>
              ))}
              {availability.filter(a => a.is_available).length === 0 && (
                <p className="text-sm text-[#3e4943] italic col-span-2">No available days set.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#3e4943] italic">No availability schedule set.</p>
          )}
        </CardContent>
      </Card>

      {/* Service Area */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
            <span className="material-symbols-outlined text-base text-[#005d42]">location_on</span>
            Service Area
          </h2>
          {profile.location_lat && profile.location_lng ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 py-2 px-3 bg-[#9ffdd3]/20 rounded-lg">
                <span className="material-symbols-outlined text-base text-[#005d42] shrink-0">location_on</span>
                <span className="text-sm font-medium text-[#1a1c1b]">
                  {profile.location_lat.toFixed(4)}, {profile.location_lng.toFixed(4)}
                </span>
              </div>
              {profile.service_radius_km && (
                <p className="text-sm text-[#3e4943]">
                  Willing to travel up to <span className="font-semibold text-[#005d42]">{profile.service_radius_km} km</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#3e4943] italic">No service area set.</p>
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
            <span className="material-symbols-outlined text-base text-[#005d42]">verified_user</span>
            Verification Status
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#f4f4f2]">
              <span className="text-sm text-[#1a1c1b]">ID Document</span>
              <Badge className={profile.id_verified
                ? 'bg-[#9ffdd3] text-[#005d42] border-0'
                : 'bg-[#eeeeec] text-[#3e4943] border-0'
              }>
                {profile.id_verified ? 'Verified' : 'Not verified'}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#f4f4f2]">
              <span className="text-sm text-[#1a1c1b]">Background Check</span>
              <Badge className={profile.criminal_check_clear
                ? 'bg-[#9ffdd3] text-[#005d42] border-0'
                : 'bg-[#eeeeec] text-[#3e4943] border-0'
              }>
                {profile.criminal_check_clear ? 'Clear' : 'Pending'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estate Registrations */}
      {estates.length > 0 && (
        <Card className="bg-white">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1a1c1b]">
              <span className="material-symbols-outlined text-base text-[#005d42]">apartment</span>
              Estate Registrations
            </h2>
            <div className="flex flex-wrap gap-2">
              {estates.map(reg => (
                <Badge
                  key={reg.id}
                  variant="outline"
                  className="gap-1 bg-[#9ffdd3]/30 border-[#97f5cc] text-[#005d42]"
                >
                  <span className="material-symbols-outlined text-xs">apartment</span>
                  {reg.estate?.name || 'Estate'}{reg.estate?.suburb ? ` · ${reg.estate.suburb}` : ''}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          asChild
          className="w-full h-12 text-base bg-[#005d42] hover:bg-[#047857] text-white font-bold rounded-lg active:scale-[0.98] transition-all"
        >
          <Link href="/worker-profile/edit">
            <span className="material-symbols-outlined text-base mr-2">edit</span>
            Edit Profile
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-12 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]">
            <Link href="/worker-cv">
              <span className="material-symbols-outlined text-base mr-2">description</span>
              My CV
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]">
            <Link href="/worker-settings">
              <span className="material-symbols-outlined text-base mr-2">settings</span>
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
