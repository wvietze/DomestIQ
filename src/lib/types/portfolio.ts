// -----------------------------------------------------------------------------
// Portfolio Types — matches portfolio_images table in database
// -----------------------------------------------------------------------------

export interface PortfolioImage {
  id: string
  worker_profile_id: string
  image_url: string
  caption: string | null
  service_id: string | null
  sort_order: number
  created_at: string
}
