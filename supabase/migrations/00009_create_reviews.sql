CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  comment TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reviews are viewable" ON reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
CREATE POLICY "Reviewers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update worker rating on new review
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  review_count INTEGER;
  worker_prof_id UUID;
BEGIN
  SELECT wp.id INTO worker_prof_id FROM worker_profiles wp WHERE wp.user_id = NEW.reviewee_id;
  IF worker_prof_id IS NOT NULL THEN
    SELECT AVG(overall_rating)::NUMERIC(3,2), COUNT(*) INTO avg_rating, review_count
    FROM reviews WHERE reviewee_id = NEW.reviewee_id;
    UPDATE worker_profiles SET overall_rating = avg_rating, total_reviews = review_count
    WHERE id = worker_prof_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_worker_rating();
