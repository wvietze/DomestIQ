'use client'

import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Edit, Star, Briefcase, MapPin, ShieldCheck, XCircle,
  FileText, Settings
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getServiceIcon } from '@/lib/utils/service-icons'
import type { WorkerProfileViewData } from '@/lib/types/worker-profile-view'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function SimpleProfileView({ data }: { data: WorkerProfileViewData }) {
  const { profile, services, availability, jobsCompleted } = data

  const initials = profile.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const completeness = profile.profile_completeness || 0
  const circumference = 2 * Math.PI * 62 // r=62 for 144px avatar area
  const dashOffset = circumference - (circumference * completeness) / 100

  // Build day availability map (0-6)
  const availableDays = new Set(
    availability.filter(a => a.is_available).map(a => a.day_of_week)
  )

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-sm mx-auto px-4 py-6 space-y-6">
      {/* Avatar with completeness ring */}
      <motion.div variants={fadeUp} className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          {/* SVG ring for completeness */}
          <svg width="144" height="144" className="absolute -top-1 -left-1" viewBox="0 0 148 148">
            <circle cx="74" cy="74" r="62" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle
              cx="74" cy="74" r="62"
              fill="none"
              stroke="url(#comp-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 74 74)"
            />
            <defs>
              <linearGradient id="comp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
          </svg>
          <Avatar className="h-36 w-36 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
            <AvatarFallback className="text-4xl bg-emerald-50 text-emerald-700 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold">{profile.full_name}</h1>

        {/* Star rating visual */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              className={`w-6 h-6 ${
                s <= Math.round(profile.overall_rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Rate */}
        {profile.hourly_rate && (
          <p className="text-3xl font-bold text-emerald-700">
            R{profile.hourly_rate}<span className="text-base font-normal text-muted-foreground">/hr</span>
          </p>
        )}
      </motion.div>

      {/* 3 icon stat circles */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {/* Rating */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-lg font-bold">{profile.overall_rating.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Rating</span>
        </div>

        {/* Jobs Done */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-emerald-600" />
          </div>
          <span className="text-lg font-bold">{jobsCompleted}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Jobs</span>
        </div>

        {/* Area km */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-sky-600" />
          </div>
          <span className="text-lg font-bold">{profile.service_radius_km || '—'}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">km</span>
        </div>
      </motion.div>

      {/* Services grid - 2 col, large icon buttons */}
      {services.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          {services.map(svc => {
            const Icon = getServiceIcon(svc.service_name)
            return (
              <div
                key={svc.id}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
                  <Icon className="w-8 h-8 text-emerald-700" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{svc.service_name}</span>
              </div>
            )
          })}
        </motion.div>
      )}

      {/* Availability dots - 7 day circles */}
      <motion.div variants={fadeUp} className="space-y-2">
        <h2 className="text-sm font-semibold text-center text-muted-foreground uppercase tracking-wide">Availability</h2>
        <div className="flex justify-center gap-2">
          {DAYS_SHORT.map((d, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                availableDays.has(i)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Verification cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${
          profile.id_verified
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            profile.id_verified ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            {profile.id_verified
              ? <ShieldCheck className="w-7 h-7 text-emerald-600" />
              : <XCircle className="w-7 h-7 text-gray-400" />
            }
          </div>
          <span className="text-xs font-medium text-center">ID Verified</span>
        </div>

        <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${
          profile.criminal_check_clear
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            profile.criminal_check_clear ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            {profile.criminal_check_clear
              ? <ShieldCheck className="w-7 h-7 text-emerald-600" />
              : <XCircle className="w-7 h-7 text-gray-400" />
            }
          </div>
          <span className="text-xs font-medium text-center">Background</span>
        </div>
      </motion.div>

      {/* Quick action buttons */}
      <motion.div variants={fadeUp} className="space-y-3">
        <Button
          asChild
          className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Link href="/worker-profile/edit">
            <Edit className="w-5 h-5 mr-2" />
            Edit Profile
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-12 rounded-2xl">
            <Link href="/worker-cv">
              <FileText className="w-4 h-4 mr-2" />
              My CV
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl">
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
