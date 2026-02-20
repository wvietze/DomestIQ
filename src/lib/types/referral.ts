// -----------------------------------------------------------------------------
// Referral Types — matches referrals table in database
// -----------------------------------------------------------------------------

export type ReferralStatus = 'pending' | 'qualified' | 'paid'

export interface Referral {
  id: string
  referrer_worker_profile_id: string
  referred_user_id: string
  referral_code_used: string
  status: ReferralStatus
  reward_amount: number
  qualified_at: string | null
  created_at: string
  // Joined fields
  referred_profile?: { full_name: string; avatar_url: string | null }
}

export interface ReferralStats {
  total_referrals: number
  qualified_referrals: number
  total_earned: number
  referral_code: string
}
