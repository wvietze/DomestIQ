// -----------------------------------------------------------------------------
// Review Types — matches reviews table in database
// -----------------------------------------------------------------------------

export type ReviewSubRatings = {
  punctuality: number | null;
  quality: number | null;
  communication: number | null;
};

// Trait-based review system (16 traits)
export const REVIEW_TRAITS = [
  'on-time',
  'efficient',
  'thorough',
  'fast',
  'detail-oriented',
  'professional',
  'reliable',
  'trustworthy',
  'respectful',
  'friendly',
  'kind',
  'great-communicator',
  'patient',
  'good-value',
  'goes-extra-mile',
  'highly-skilled',
] as const;

export type ReviewTrait = (typeof REVIEW_TRAITS)[number];

export const TRAIT_LABELS: Record<ReviewTrait, string> = {
  'on-time': 'On Time',
  'efficient': 'Efficient',
  'thorough': 'Thorough',
  'fast': 'Fast',
  'detail-oriented': 'Detail-Oriented',
  'professional': 'Professional',
  'reliable': 'Reliable',
  'trustworthy': 'Trustworthy',
  'respectful': 'Respectful',
  'friendly': 'Friendly',
  'kind': 'Kind',
  'great-communicator': 'Great Communicator',
  'patient': 'Patient',
  'good-value': 'Good Value',
  'goes-extra-mile': 'Goes Extra Mile',
  'highly-skilled': 'Highly Skilled',
};

export const TRAIT_EMOJIS: Record<ReviewTrait, string> = {
  'on-time': '\u{23F0}',
  'efficient': '\u{26A1}',
  'thorough': '\u{1F50D}',
  'fast': '\u{1F3C3}',
  'detail-oriented': '\u{2728}',
  'professional': '\u{1F454}',
  'reliable': '\u{1F91D}',
  'trustworthy': '\u{1F6E1}',
  'respectful': '\u{1F64F}',
  'friendly': '\u{1F60A}',
  'kind': '\u{2764}',
  'great-communicator': '\u{1F4AC}',
  'patient': '\u{1F54A}',
  'good-value': '\u{1F4B0}',
  'goes-extra-mile': '\u{1F31F}',
  'highly-skilled': '\u{1F3AF}',
};

export type Review = {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  overall_rating: number;
  punctuality: number | null;
  quality: number | null;
  communication: number | null;
  comment: string | null;
  traits: ReviewTrait[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ReviewRequest = {
  id: string;
  worker_id: string;
  client_id: string;
  booking_id: string;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
  expires_at: string;
};
