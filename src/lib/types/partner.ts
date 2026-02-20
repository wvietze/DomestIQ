// -----------------------------------------------------------------------------
// Partner, Sponsorship & Advertising Types
// -----------------------------------------------------------------------------

export type PartnerApplicationStatus = 'pending' | 'contacted' | 'approved' | 'rejected';
export type CompanyType = 'bank' | 'insurer' | 'micro_lender' | 'sponsor' | 'advertiser' | 'government' | 'other';
export type PartnerInterest = 'data_api' | 'sponsorship' | 'advertising' | 'multiple';

export type PartnerApplication = {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_type: CompanyType;
  interest: PartnerInterest;
  message: string | null;
  website: string | null;
  status: PartnerApplicationStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
};

export type SponsorshipPlacement =
  | 'verification'
  | 'onboarding_worker'
  | 'onboarding_client'
  | 'dashboard_worker'
  | 'dashboard_client'
  | 'search'
  | 'landing';

export type Sponsorship = {
  id: string;
  partner_name: string;
  partner_logo_url: string | null;
  placement: SponsorshipPlacement;
  headline: string;
  description: string | null;
  cta_text: string | null;
  cta_url: string | null;
  bg_color: string;
  text_color: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
};

export type AdPlacement = 'worker_dashboard' | 'client_dashboard' | 'search_results' | 'worker_profile';
export type AdTargetRole = 'worker' | 'client' | 'all';

export type Ad = {
  id: string;
  advertiser_name: string;
  advertiser_logo_url: string | null;
  placement: AdPlacement;
  target_services: string[] | null;
  target_role: AdTargetRole;
  headline: string;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_url: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
};

export type PlatformStats = {
  total_workers: number;
  total_bookings: number;
  service_categories: { name: string; count: number }[];
  city_distribution: { city: string; count: number }[];
  average_rating: number;
  monthly_booking_trend: { month: string; count: number }[];
};
