'use client'

import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { WorkerProfileViewData } from '@/lib/types/worker-profile-view'

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
  const circumference = 2 * Math.PI * 62
  const dashOffset = circumference - (circumference * completeness) / 100

  const availableDays = new Set(
    availability.filter(a => a.is_available).map(a => a.day_of_week)
  )

  return (
    <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
      {/* Avatar with completeness ring */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <svg width="144" height="144" className="absolute -top-1 -left-1" viewBox="0 0 148 148">
            <circle cx="74" cy="74" r="62" fill="none" stroke="#e2e3e1" strokeWidth="4" />
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
                <stop offset="0%" stopColor="#fe932c" />
                <stop offset="100%" stopColor="#005d42" />
              </linearGradient>
            </defs>
          </svg>
          <Avatar className="h-36 w-36 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
            <AvatarFallback className="text-4xl bg-[#9ffdd3] text-[#005d42] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <h1 className="text-2xl font-bold text-[#1a1c1b]">{profile.full_name}</h1>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <span
              key={s}
              className="material-symbols-outlined text-2xl"
              style={{
                color: s <= Math.round(profile.overall_rating) ? '#fe932c' : '#e2e3e1',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              star
            </span>
          ))}
        </div>

        {profile.hourly_rate && (
          <p className="text-3xl font-bold text-[#005d42]">
            R{profile.hourly_rate}<span className="text-base font-normal text-[#3e4943]">/hr</span>
          </p>
        )}
      </div>

      {/* 3 icon stat circles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-[#ffdcc3]/40 border-2 border-[#ffdcc3] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[#fe932c]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <span className="text-lg font-bold text-[#1a1c1b]">{profile.overall_rating.toFixed(1)}</span>
          <span className="text-[10px] text-[#3e4943] uppercase tracking-wide">Rating</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-[#9ffdd3]/40 border-2 border-[#97f5cc] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[#005d42]">work</span>
          </div>
          <span className="text-lg font-bold text-[#1a1c1b]">{jobsCompleted}</span>
          <span className="text-[10px] text-[#3e4943] uppercase tracking-wide">Jobs</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-[#9ffdd3]/40 border-2 border-[#97f5cc] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[#005d42]">location_on</span>
          </div>
          <span className="text-lg font-bold text-[#1a1c1b]">{profile.service_radius_km || '—'}</span>
          <span className="text-[10px] text-[#3e4943] uppercase tracking-wide">km</span>
        </div>
      </div>

      {/* Services grid */}
      {services.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {services.map(svc => (
            <div
              key={svc.id}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#9ffdd3]/20 border border-[#97f5cc]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#97f5cc] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-3xl text-[#005d42]">work</span>
              </div>
              <span className="text-xs font-medium text-center leading-tight text-[#1a1c1b]">{svc.service_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Availability dots */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-center text-[#3e4943] uppercase tracking-wide">Availability</h2>
        <div className="flex justify-center gap-2">
          {DAYS_SHORT.map((d, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                availableDays.has(i)
                  ? 'bg-[#005d42] text-white'
                  : 'bg-[#eeeeec] text-[#3e4943]'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Verification cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${
          profile.id_verified
            ? 'bg-[#9ffdd3]/30 border-[#97f5cc]'
            : 'bg-[#f4f4f2] border-[#bdc9c1]'
        }`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            profile.id_verified ? 'bg-[#9ffdd3]' : 'bg-[#eeeeec]'
          }`}>
            <span className={`material-symbols-outlined text-3xl ${profile.id_verified ? 'text-[#005d42]' : 'text-[#6e7a73]'}`}>
              {profile.id_verified ? 'verified_user' : 'cancel'}
            </span>
          </div>
          <span className="text-xs font-medium text-center text-[#1a1c1b]">ID Verified</span>
        </div>

        <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${
          profile.criminal_check_clear
            ? 'bg-[#9ffdd3]/30 border-[#97f5cc]'
            : 'bg-[#f4f4f2] border-[#bdc9c1]'
        }`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            profile.criminal_check_clear ? 'bg-[#9ffdd3]' : 'bg-[#eeeeec]'
          }`}>
            <span className={`material-symbols-outlined text-3xl ${profile.criminal_check_clear ? 'text-[#005d42]' : 'text-[#6e7a73]'}`}>
              {profile.criminal_check_clear ? 'verified_user' : 'cancel'}
            </span>
          </div>
          <span className="text-xs font-medium text-center text-[#1a1c1b]">Background</span>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="space-y-3">
        <Button
          asChild
          className="w-full h-14 text-base rounded-2xl bg-[#005d42] hover:bg-[#047857] text-white font-bold"
        >
          <Link href="/worker-profile/edit">
            <span className="material-symbols-outlined text-xl mr-2">edit</span>
            Edit Profile
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-12 rounded-2xl border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]">
            <Link href="/worker-cv">
              <span className="material-symbols-outlined text-base mr-2">description</span>
              My CV
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl border-[#bdc9c1] text-[#1a1c1b] hover:bg-[#f4f4f2]">
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
