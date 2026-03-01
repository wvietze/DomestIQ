'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Edit, Star, Briefcase, MapPin, ShieldCheck, BadgeCheck,
  FileText, Settings, Camera, User, PenLine, Plus, ChevronLeft,
  ChevronRight, X, Calendar, Clock, GraduationCap, Building2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getServiceIcon } from '@/lib/utils/service-icons'
import { TRAIT_LABELS, TRAIT_EMOJIS } from '@/lib/types/review'
import type { WorkerProfileViewData } from '@/lib/types/worker-profile-view'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const SKILL_COLORS: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-emerald-100 text-emerald-700',
  expert: 'bg-purple-100 text-purple-700',
}

function PromptCard({ icon: Icon, title, description, href }: {
  icon: React.ElementType
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 transition-colors">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Plus className="w-4 h-4 text-amber-500 shrink-0" />
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
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header Banner */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 pb-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative flex items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg shrink-0">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-2xl bg-white/20 text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-white">
                <h1 className="text-xl font-bold truncate">{profile.full_name}</h1>
                <p className="text-sm text-emerald-100 truncate">{headline}</p>
                {profile.location_lat && (
                  <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.service_radius_km ? `${profile.service_radius_km}km radius` : 'Location set'}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{profile.overall_rating.toFixed(1)}</span>
                    <span className="text-xs text-emerald-200">({profile.total_reviews})</span>
                  </div>
                  {profile.id_verified && (
                    <Badge className="bg-white/20 text-white border-0 gap-1 text-xs">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {profile.criminal_check_clear && (
                    <Badge className="bg-white/20 text-white border-0 gap-1 text-xs">
                      <ShieldCheck className="w-3 h-3" />
                      Background Clear
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Quick stats row */}
          <div className="grid grid-cols-3 divide-x">
            <div className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">{jobsCompleted}</p>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Jobs Done</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-lg font-bold text-amber-600">
                {profile.hourly_rate ? `R${profile.hourly_rate}` : '—'}
              </p>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Per Hour</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">{completeness}%</p>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Complete</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Completeness prompts */}
      {completeness < 100 && (
        <motion.div variants={fadeUp} className="space-y-2">
          {!profile.bio && (
            <PromptCard
              icon={PenLine}
              title="Add your bio"
              description="Tell clients about yourself and your experience"
              href="/worker-profile/edit"
            />
          )}
          {portfolio.length === 0 && (
            <PromptCard
              icon={Camera}
              title="Upload portfolio photos"
              description="Show off your best work to attract more clients"
              href="/worker-profile/edit"
            />
          )}
          {references.length === 0 && (
            <PromptCard
              icon={User}
              title="Request a reference"
              description="References from past clients build trust"
              href="/worker-profile/edit"
            />
          )}
          {!cvData && (
            <PromptCard
              icon={FileText}
              title="Build your CV"
              description="A complete CV helps you stand out"
              href="/worker-cv"
            />
          )}
        </motion.div>
      )}

      {/* About */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              About
            </h2>
            {profile.bio ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            ) : cvData?.personal_statement ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{cvData.personal_statement}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No bio added yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Services & Skills table */}
      {services.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Services & Skills
              </h2>
              <div className="space-y-3">
                {services.map(svc => {
                  const Icon = getServiceIcon(svc.service_name)
                  return (
                    <div key={svc.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{svc.service_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {svc.skill_level && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SKILL_COLORS[svc.skill_level] || 'bg-gray-100 text-gray-600'}`}>
                              {svc.skill_level}
                            </span>
                          )}
                          {svc.years_experience != null && (
                            <span className="text-[10px] text-muted-foreground">
                              {svc.years_experience} {svc.years_experience === 1 ? 'year' : 'years'}
                            </span>
                          )}
                        </div>
                      </div>
                      {svc.custom_rate && (
                        <span className="text-sm font-semibold text-emerald-700">R{svc.custom_rate}/hr</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Portfolio gallery */}
      {portfolio.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
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
        </motion.div>
      )}

      {/* Portfolio lightbox */}
      {lightboxIdx !== null && portfolio[lightboxIdx] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxIdx(null)}>
            <X className="w-6 h-6" />
          </button>
          {lightboxIdx > 0 && (
            <button className="absolute left-4 text-white" onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {lightboxIdx < portfolio.length - 1 && (
            <button className="absolute right-4 text-white" onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }}>
              <ChevronRight className="w-8 h-8" />
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
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Reviews & Traits
              </h2>
              {/* Top traits */}
              {topTraits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topTraits.map(trait => (
                    <Badge
                      key={trait}
                      variant="outline"
                      className="gap-1 bg-amber-50 border-amber-200 text-amber-800"
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
                    <div key={review.id} className="p-3 rounded-xl bg-gray-50 space-y-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.overall_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">&ldquo;{review.comment}&rdquo;</p>
                      )}
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground">
                      +{reviews.length - 3} more reviews
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* References */}
      {references.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                References
              </h2>
              <div className="space-y-3">
                {references.map(ref => (
                  <div key={ref.id} className="p-3 rounded-xl bg-gray-50 space-y-1">
                    <p className="text-sm font-medium">{ref.client_name || 'Client'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{ref.relationship.replace('_', ' ')}</p>
                    {ref.duration_months && (
                      <p className="text-xs text-muted-foreground">{ref.duration_months} months</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">&ldquo;{ref.reference_text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Work History & Education (from CV data) */}
      {cvData && (cvData.work_history.length > 0 || cvData.education.length > 0) && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4 space-y-4">
              {cvData.work_history.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Work History
                  </h2>
                  <div className="space-y-3">
                    {cvData.work_history.map((job, i) => (
                      <div key={i} className="border-l-2 border-emerald-200 pl-3 space-y-0.5">
                        <p className="text-sm font-medium">{job.role}</p>
                        <p className="text-xs text-muted-foreground">{job.employer}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.start_date} — {job.end_date || 'Present'}
                        </p>
                        {job.description && (
                          <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cvData.education.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    Education
                  </h2>
                  <div className="space-y-3">
                    {cvData.education.map((edu, i) => (
                      <div key={i} className="border-l-2 border-sky-200 pl-3 space-y-0.5">
                        <p className="text-sm font-medium">{edu.qualification}</p>
                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                        <p className="text-xs text-muted-foreground">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Availability */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Availability
            </h2>
            {availability.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availability.filter(a => a.is_available).map(slot => (
                  <div key={slot.id} className="flex items-center justify-between py-2 px-3 bg-emerald-50/50 rounded-lg">
                    <span className="text-sm font-medium">{DAYS[slot.day_of_week]}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))}
                {availability.filter(a => a.is_available).length === 0 && (
                  <p className="text-sm text-muted-foreground italic col-span-2">No available days set.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No availability schedule set.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Area */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Service Area
            </h2>
            {profile.location_lat && profile.location_lng ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 py-2 px-3 bg-emerald-50/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium">
                    {profile.location_lat.toFixed(4)}, {profile.location_lng.toFixed(4)}
                  </span>
                </div>
                {profile.service_radius_km && (
                  <p className="text-sm text-muted-foreground">
                    Willing to travel up to <span className="font-semibold text-emerald-700">{profile.service_radius_km} km</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No service area set.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Status */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verification Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <span className="text-sm">ID Document</span>
                <Badge className={profile.id_verified
                  ? 'bg-emerald-100 text-emerald-700 border-0'
                  : 'bg-gray-100 text-gray-500 border-0'
                }>
                  {profile.id_verified ? 'Verified' : 'Not verified'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <span className="text-sm">Background Check</span>
                <Badge className={profile.criminal_check_clear
                  ? 'bg-emerald-100 text-emerald-700 border-0'
                  : 'bg-gray-100 text-gray-500 border-0'
                }>
                  {profile.criminal_check_clear ? 'Clear' : 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Estate Registrations */}
      {estates.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Estate Registrations
              </h2>
              <div className="flex flex-wrap gap-2">
                {estates.map(reg => (
                  <Badge
                    key={reg.id}
                    variant="outline"
                    className="gap-1 bg-emerald-50 border-emerald-200 text-emerald-700"
                  >
                    <Building2 className="w-3 h-3" />
                    {reg.estate?.name || 'Estate'}{reg.estate?.suburb ? ` · ${reg.estate.suburb}` : ''}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div variants={fadeUp} className="space-y-3">
        <Button
          asChild
          className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Link href="/worker-profile/edit">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-12">
            <Link href="/worker-cv">
              <FileText className="w-4 h-4 mr-2" />
              My CV
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12">
            <Link href="/worker-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
