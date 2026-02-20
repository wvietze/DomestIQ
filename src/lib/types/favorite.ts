export interface FavoriteWorker {
  id: string
  client_id: string
  worker_id: string
  created_at: string
}

export interface FavoriteWorkerWithProfile extends FavoriteWorker {
  profiles: {
    full_name: string
    avatar_url: string | null
  }
  worker_profiles: {
    hourly_rate: number | null
    overall_rating: number
    total_reviews: number
    id_verified: boolean
    criminal_check_clear: boolean
    bio: string | null
  } | null
  worker_services?: Array<{ services: { name: string } }>
}
