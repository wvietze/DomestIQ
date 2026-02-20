// -----------------------------------------------------------------------------
// Worker Types — matches database schema
// -----------------------------------------------------------------------------

export type WorkerProfile = {
  id: string;
  user_id: string;
  bio: string | null;
  hourly_rate: number | null;
  overall_rating: number;
  total_reviews: number;
  location_lat: number | null;
  location_lng: number | null;
  service_radius_km: number;
  id_verified: boolean;
  criminal_check_clear: boolean;
  search_rank: number;
  profile_completeness: number;
  is_active: boolean;
  referral_code: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkerService = {
  id: string;
  worker_id: string;
  service_id: string;
  skill_level: string | null;
  custom_rate: number | null;
  years_experience: number | null;
  created_at: string;
};

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WorkerAvailability = {
  id: string;
  worker_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
};

export type WorkerBlockedDate = {
  id: string;
  worker_id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
};

export type WorkerServiceArea = {
  id: string;
  worker_id: string;
  area_name: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  created_at: string;
};
