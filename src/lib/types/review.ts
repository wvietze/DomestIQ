// -----------------------------------------------------------------------------
// Review Types — matches reviews table in database
// -----------------------------------------------------------------------------

export type ReviewSubRatings = {
  punctuality: number | null;
  quality: number | null;
  communication: number | null;
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
  is_public: boolean;
  created_at: string;
  updated_at: string;
};
