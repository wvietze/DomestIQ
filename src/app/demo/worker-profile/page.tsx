'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, FileText, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { SimpleProfileView } from '@/components/worker-profile/simple-profile-view'
import { ProfessionalProfileView } from '@/components/worker-profile/professional-profile-view'
import type { WorkerProfileViewData } from '@/lib/types/worker-profile-view'

const mockData: WorkerProfileViewData = {
  profile: {
    id: 'demo-wp-1',
    user_id: 'demo-user-1',
    full_name: 'Thandiwe Mokoena',
    avatar_url: null,
    phone: '+27 82 123 4567',
    email: 'thandiwe@example.com',
    bio: 'Experienced domestic worker and gardener with over 8 years in the industry. I take pride in leaving every home spotless and every garden flourishing. Known for my attention to detail and reliability. I treat every home like my own.',
    hourly_rate: 120,
    overall_rating: 4.7,
    total_reviews: 23,
    profile_completeness: 72,
    is_active: true,
    id_verified: true,
    criminal_check_clear: false,
    location_lat: -26.1076,
    location_lng: 28.0567,
    service_radius_km: 15,
    referral_code: 'THANDI2024',
    created_at: '2024-03-15T10:00:00Z',
  },
  services: [
    {
      id: 's1',
      service_id: 'domestic-worker',
      service_name: 'Domestic Worker',
      category: 'household',
      skill_level: 'expert',
      years_experience: 8,
      custom_rate: 120,
    },
    {
      id: 's2',
      service_id: 'gardener',
      service_name: 'Gardener',
      category: 'outdoor',
      skill_level: 'advanced',
      years_experience: 5,
      custom_rate: 100,
    },
    {
      id: 's3',
      service_id: 'window-cleaner',
      service_name: 'Window Cleaner',
      category: 'household',
      skill_level: 'intermediate',
      years_experience: 3,
      custom_rate: null,
    },
    {
      id: 's4',
      service_id: 'babysitter',
      service_name: 'Babysitter',
      category: 'childcare',
      skill_level: 'advanced',
      years_experience: 6,
      custom_rate: 130,
    },
  ],
  availability: [
    { id: 'a1', worker_id: 'demo-wp-1', day_of_week: 1, start_time: '07:00:00', end_time: '17:00:00', is_available: true, created_at: '2024-01-01' },
    { id: 'a2', worker_id: 'demo-wp-1', day_of_week: 2, start_time: '07:00:00', end_time: '17:00:00', is_available: true, created_at: '2024-01-01' },
    { id: 'a3', worker_id: 'demo-wp-1', day_of_week: 3, start_time: '07:00:00', end_time: '17:00:00', is_available: true, created_at: '2024-01-01' },
    { id: 'a4', worker_id: 'demo-wp-1', day_of_week: 4, start_time: '07:00:00', end_time: '17:00:00', is_available: true, created_at: '2024-01-01' },
    { id: 'a5', worker_id: 'demo-wp-1', day_of_week: 5, start_time: '07:00:00', end_time: '14:00:00', is_available: true, created_at: '2024-01-01' },
    { id: 'a6', worker_id: 'demo-wp-1', day_of_week: 6, start_time: '08:00:00', end_time: '12:00:00', is_available: true, created_at: '2024-01-01' },
    { id: 'a0', worker_id: 'demo-wp-1', day_of_week: 0, start_time: '00:00:00', end_time: '00:00:00', is_available: false, created_at: '2024-01-01' },
  ],
  portfolio: [
    { id: 'p1', worker_profile_id: 'demo-wp-1', image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzA0Nzg1NyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCI+R2FyZGVuPC90ZXh0Pjwvc3ZnPg==', caption: 'Garden transformation', service_id: 'gardener', sort_order: 0, created_at: '2024-06-01' },
    { id: 'p2', worker_profile_id: 'demo-wp-1', image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzBkOTQ4OCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCI+S2l0Y2hlbjwvdGV4dD48L3N2Zz4=', caption: 'Kitchen deep clean', service_id: 'domestic-worker', sort_order: 1, created_at: '2024-06-10' },
    { id: 'p3', worker_profile_id: 'demo-wp-1', image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Q5NzcwNiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCI+V2luZG93czwvdGV4dD48L3N2Zz4=', caption: 'Sparkling windows', service_id: 'window-cleaner', sort_order: 2, created_at: '2024-07-01' },
  ],
  reviews: [
    {
      id: 'r1', booking_id: 'b1', reviewer_id: 'c1', reviewee_id: 'demo-user-1',
      overall_rating: 5, punctuality: 5, quality: 5, communication: 5,
      comment: 'Thandiwe is absolutely wonderful. My house has never been so clean. She even organized the pantry without being asked!',
      traits: ['thorough', 'reliable', 'goes-extra-mile'], is_public: true,
      created_at: '2024-08-15', updated_at: '2024-08-15',
    },
    {
      id: 'r2', booking_id: 'b2', reviewer_id: 'c2', reviewee_id: 'demo-user-1',
      overall_rating: 5, punctuality: 5, quality: 4, communication: 5,
      comment: 'Always on time, friendly, and does a brilliant job with the garden. Highly recommend.',
      traits: ['on-time', 'friendly', 'reliable'], is_public: true,
      created_at: '2024-07-20', updated_at: '2024-07-20',
    },
    {
      id: 'r3', booking_id: 'b3', reviewer_id: 'c3', reviewee_id: 'demo-user-1',
      overall_rating: 4, punctuality: 4, quality: 4, communication: 5,
      comment: 'Very professional and great with the kids. We feel completely safe.',
      traits: ['trustworthy', 'professional', 'kind'], is_public: true,
      created_at: '2024-06-10', updated_at: '2024-06-10',
    },
    {
      id: 'r4', booking_id: 'b4', reviewer_id: 'c4', reviewee_id: 'demo-user-1',
      overall_rating: 5, punctuality: 5, quality: 5, communication: 4,
      comment: 'Best domestic worker we have ever had. Period.',
      traits: ['highly-skilled', 'efficient', 'thorough'], is_public: true,
      created_at: '2024-05-05', updated_at: '2024-05-05',
    },
  ],
  topTraits: ['reliable', 'thorough', 'on-time', 'friendly', 'goes-extra-mile'],
  references: [
    {
      id: 'ref1', worker_id: 'demo-wp-1', client_id: 'c1', booking_id: 'b1',
      reference_text: 'Thandiwe has worked for our family for 3 years. She is dependable, honest, and takes great initiative. I would recommend her without hesitation to anyone looking for quality domestic help.',
      relationship: 'regular_client' as const, duration_months: 36, is_visible_on_profile: true,
      created_at: '2024-07-01', client_name: 'Sarah van der Merwe',
    },
    {
      id: 'ref2', worker_id: 'demo-wp-1', client_id: 'c5', booking_id: 'b5',
      reference_text: 'Thandiwe maintained our garden beautifully for over a year. Always on time, always professional. Our garden has never looked better.',
      relationship: 'employer' as const, duration_months: 14, is_visible_on_profile: true,
      created_at: '2024-04-15', client_name: 'James Ndlovu',
    },
  ],
  estates: [
    {
      id: 'e1', worker_id: 'demo-wp-1', estate_id: 'est1', registration_number: 'SW-4521',
      registered_since: '2023-06-01', created_at: '2023-06-01',
      estate: { id: 'est1', name: 'Sandton Views', suburb: 'Sandton', city: 'Johannesburg', province: 'Gauteng', location_lat: -26.1, location_lng: 28.05, security_company: null, requires_preregistration: true, is_verified: true, added_by: 'admin', created_at: '2023-01-01' },
    },
    {
      id: 'e2', worker_id: 'demo-wp-1', estate_id: 'est2', registration_number: 'BC-1187',
      registered_since: '2024-01-15', created_at: '2024-01-15',
      estate: { id: 'est2', name: 'Bryanston Country', suburb: 'Bryanston', city: 'Johannesburg', province: 'Gauteng', location_lat: -26.06, location_lng: 28.01, security_company: null, requires_preregistration: true, is_verified: true, added_by: 'admin', created_at: '2023-01-01' },
    },
  ],
  jobsCompleted: 47,
  cvData: {
    id: 'cv1', worker_id: 'demo-wp-1',
    work_history: [
      { role: 'Domestic Worker', employer: 'Van der Merwe Family', start_date: '2021-03', end_date: null, description: 'Full house cleaning, laundry, ironing, and cooking for a family of 5.' },
      { role: 'Gardener', employer: 'Ndlovu Residence', start_date: '2019-06', end_date: '2021-02', description: 'Garden maintenance, landscaping, and pool area upkeep.' },
      { role: 'Domestic Worker', employer: 'Patel Household', start_date: '2016-01', end_date: '2019-05', description: 'General cleaning, childcare, and meal preparation.' },
    ],
    education: [
      { qualification: 'Matric Certificate', institution: 'Jeppe High School for Girls', year: 2015 },
      { qualification: 'First Aid Level 1', institution: 'St John Ambulance', year: 2020 },
    ],
    skills: ['Deep cleaning', 'Laundry & ironing', 'Cooking', 'Gardening', 'Childcare', 'Pet care'],
    languages: ['English', 'isiZulu', 'Sesotho'],
    personal_statement: 'Dedicated and experienced domestic professional with a passion for creating clean, comfortable living spaces. I bring 8+ years of experience in household management, gardening, and childcare.',
    created_at: '2024-01-01', updated_at: '2024-06-01',
  },
}

export default function DemoWorkerProfilePage() {
  const [viewMode, setViewMode] = useState<'simple' | 'professional'>('simple')

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link
              href="/demo"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Demo
            </Link>

            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setViewMode('simple')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'simple'
                    ? 'bg-white shadow-sm text-emerald-700'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Simple
              </button>
              <button
                onClick={() => setViewMode('professional')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'professional'
                    ? 'bg-white shadow-sm text-emerald-700'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4" />
                Professional
              </button>
            </div>

            <div className="w-16" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Demo badge */}
      <div className="flex justify-center py-2">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Demo — Mock Data (Thandiwe Mokoena)
        </div>
      </div>

      {/* Render active view */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'simple' ? (
          <SimpleProfileView data={mockData} />
        ) : (
          <ProfessionalProfileView data={mockData} />
        )}
      </motion.div>
    </div>
  )
}
