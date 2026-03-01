import type { WorkerProfile, WorkerService, WorkerAvailability } from './worker'
import type { PortfolioImage } from './portfolio'
import type { Review } from './review'
import type { WorkerReference } from './reference'
import type { WorkerEstateRegistration } from './estate'
import type { WorkerCvData } from './cv'

export interface WorkerServiceView {
  id: string
  service_id: string
  service_name: string
  category: string
  skill_level: string | null
  years_experience: number | null
  custom_rate: number | null
}

export interface WorkerProfileViewData {
  // Core profile
  profile: {
    id: string
    user_id: string
    full_name: string
    avatar_url: string | null
    phone: string | null
    email: string | null
    bio: string | null
    hourly_rate: number | null
    overall_rating: number
    total_reviews: number
    profile_completeness: number
    is_active: boolean
    id_verified: boolean
    criminal_check_clear: boolean
    location_lat: number | null
    location_lng: number | null
    service_radius_km: number | null
    referral_code: string | null
    created_at: string
  }

  // Services with enriched data
  services: WorkerServiceView[]

  // Availability schedule
  availability: WorkerAvailability[]

  // Portfolio images
  portfolio: PortfolioImage[]

  // Reviews
  reviews: Review[]

  // Top traits (from worker_profiles.top_traits)
  topTraits: string[]

  // References
  references: WorkerReference[]

  // Estate registrations
  estates: WorkerEstateRegistration[]

  // Jobs completed count
  jobsCompleted: number

  // CV data
  cvData: WorkerCvData | null
}
